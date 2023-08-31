-- 'token_ranking' CTE computes balance, fiat_balance and ranks the tokens based on their fiat_balance
WITH token_ranking AS (
    SELECT
        tokens.id,
        tokens.name,
        tokens.symbol,
        tokens.decimals,
        SUM(balances.balance) as balance,  -- Summing up all the balance for each token
        COALESCE(SUM(COALESCE(balances.balance * (token_prices.value::text)::numeric / (10 ^ tokens.decimals), 0)), 0) AS fiat_balance, -- Calculating the fiat balance for each token
        ROW_NUMBER() OVER(ORDER BY COALESCE(SUM(COALESCE(balances.balance * (token_prices.value::text)::numeric / (10 ^ tokens.decimals), 0)), 0) DESC) as rank -- Ranking tokens based on fiat_balance
    FROM
        balances
        INNER JOIN tokens ON tokens.id = balances.token_id
        LEFT JOIN spam_tokens ON spam_tokens.token_id = tokens.id, -- Excluding spam tokens by joining and checking for NULL in WHERE clause
        json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices -- Parsing JSON to get token prices
    WHERE
        balances.wallet_id = {{ $walletId }}
        AND balances.wallet_id IS NOT NULL
        AND token_prices.key = '{{ $currency }}' -- Selecting token prices in currency specified in the query
        AND spam_tokens.token_id IS NULL -- Condition to exclude spam tokens
        AND tokens.network_id IN ({{ $networkIds }})
    GROUP BY
        tokens.id
),
-- 'total_fiat_balance' CTE computes the total fiat balance
total_fiat_balance AS (
    SELECT
        SUM(fiat_balance) AS total_fiat
    FROM token_ranking
)
SELECT
    name,
    symbol,
    balance,
    decimals,
    fiat_balance,
    -- Computing the percentage of each token's fiat_balance in the total fiat_balance
    CASE
        WHEN total_fiat > 0 THEN
                fiat_balance / total_fiat
        ELSE 0
    END AS percentage
FROM
(
    SELECT
        name,
        symbol,
        balance,
        decimals,
        fiat_balance
    FROM token_ranking
    WHERE rank <= {{ $topCount }} -- Selecting top N tokens based on rank

    UNION ALL

    SELECT
        STRING_AGG(name, ', ') as name, -- Aggregating the names of all other tokens
        'Other' as symbol, -- Giving the symbol as 'other' for aggregated tokens
        CAST(NULL AS numeric) as balance, -- Giving NULL as balance for aggregated tokens
        CAST(NULL AS numeric) as decimals, -- Giving NULL as decimals for aggregated tokens
        SUM(fiat_balance) as fiat_balance -- Summing up the fiat_balance for all other tokens
    FROM token_ranking
    WHERE rank > {{ $topCount }} -- Selecting all other tokens except the top N
    HAVING COUNT(*) > 0 -- Ensures that 'Other' will only be returned when there are tokens outside of the top N
) sub
CROSS JOIN total_fiat_balance -- Joining the results with total_fiat_balance to compute the percentage
