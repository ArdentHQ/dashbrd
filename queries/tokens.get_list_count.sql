SELECT COUNT(DISTINCT tokens.id) AS item_count
FROM balances
INNER JOIN tokens ON tokens.id = balances.token_id
INNER JOIN networks ON tokens.network_id = networks.id
LEFT JOIN spam_tokens ON spam_tokens.token_id = tokens.id
LEFT JOIN json_each(tokens.extra_attributes -> 'market_data' -> 'current_prices') AS token_prices ON TRUE
WHERE balances.wallet_id = {{ $walletId }}
    AND balances.wallet_id IS NOT NULL
    AND spam_tokens.token_id IS NULL
    AND networks.chain_id IN ({{ $chainIds }});
