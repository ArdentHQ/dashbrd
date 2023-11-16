<?php

declare(strict_types=1);

return [
    'onboarding' => [
        'title' => 'Get Started',
        'heading' => 'Your monkeys were bored and ran off, we are trying to round them up.',
        'message' => 'We are setting up your account. This process usually takes just a few minutes, but can take up to 15 minutes.',
    ],

    'error' => [
        'heading' => 'Oops, something went wrong ...',
        'message' => 'Please try again or get in touch if the issue persists.',
    ],

    'maintenance' => [
        'title' => 'Dashbrd is currently down for scheduled maintenance.',
        'description' => 'We expect to be back soon. Thanks for your patience.',
    ],

    'dashboard' => [
        'title' => 'My Wallet',
        'breakdown' => [
            'title' => 'Portfolio Breakdown',
        ],
        'line_chart' => [
            'data_error' => 'Could not load chart data',
        ],
    ],

    'articles' => [
        'title' => 'Articles',
        'featured_collections' => 'Featured Collections',
        'placeholder_more_soon' => 'More Soon',
        'no_articles' => 'No articles have been published yet. Please check back later!',
        'header_title' => 'Explore our collection of',
        'header_suffix_one' => 'published article',
        'header_suffix_other' => 'published articles',
        'audio_version' => 'Audio version',
        'consists_of_collections' => '{0} This article highlights :count collections|{1} This article highlights :count collection|[2,*] This article highlights :count collections',
    ],
    'collections' => [
        'title' => 'Collections',
        'collections' => 'Collections',
        'collection_value' => 'Collection Value',
        'nfts_owned' => 'NFTs Owned',
        'header_title' => 'You own <0>:nftsCount</0> :nfts across <0>:collectionsCount</0> :collections, worth about <0><1>:worth</1></0>',
        'search_placeholder' => 'Search by Collection',
        'properties' => 'Properties',
        'collections_network' => 'Collections Network',
        'property_search_placeholder' => 'Feature Search',
        'floor_price' => 'Floor Price',
        'value' => 'Value',
        'rarity' => 'Rarity',
        'report' => 'Report',
        'hide_collection' => 'Hide Collection',
        'unhide_collection' => 'Unhide Collection',
        'no_collections' => 'You do not own any NFTs yet. Once you do they will be shown here.',
        'all_collections_hidden' => 'You have hidden all your collections. Unhide and they will appear here.',
        'about_collection' => 'About Collection',
        'show_hidden' => 'Show Hidden',
        'show_my_collection' => 'Show My Collection',
        'owned' => 'Owned',
        'activities' => [
            'loading_activities' => "We're fetching Activity for this NFT, please hang tight, this can take a while.",
            'loading_activities_collection' => "We're fetching Activity for this collection, please hang tight, this can take a while.",
            'ignores_activities' => "We don't support activity history for this collection yet.",
            'no_activity' => 'This collection does not have any activity yet.',
            'types' => [
                'LABEL_MINT' => 'Mint',
                'LABEL_TRANSFER' => 'Transfer',
                'LABEL_SALE' => 'Sale',
            ],
        ],
        'articles' => [
            'no_articles' => 'No articles have been linked to this collection as of now.',
            'no_articles_with_filters' => 'We could not find any articles matching your search criteria, please try again!',
            'search_placeholder' => 'Search in Articles',
            'sort_latest' => 'Latest',
            'sort_popularity' => 'Most Popular',
        ],
        'search' => [
            'loading_results' => 'Loading results...',
            'no_results' => 'We could not find anything matching your search criteria, please try again!',
            'no_results_with_filters' => 'We could not find anything matching your filters, please try again!',
            'no_results_ownership' => 'You do not own any NFTs in this collection',
            'error' => 'Could not load search results. Please try again later.',
        ],
        'sorting' => [
            'token_number' => 'Token Number',
            'recently_received' => 'Recently Received',
            'recently_created' => 'Recently Created',
            'oldest_collection' => 'Oldest Collection',
        ],
        'traits' => [
            'description' => 'List of NFT traits by % of occurrence in the collection',
            'no_traits' => 'No Properties can be found for this NFT',
        ],
        'menu' => [
            'collection' => 'Collection',
            'articles' => 'Articles',
            'activity' => 'Activity',
        ],
        'hidden_modal' => [
            'collection_hidden' => 'Collection Hidden',
            'description' => 'This collection is currently set to Hidden. Are you sure you want to unhide this collection? You can
            reset the collection to hidden from the collection menu.',
            'unhide' => 'Unhide',
            'error' => 'Something went wrong. Please try again.',
        ],
        'external_modal' => [
            'you_wish_continue' => 'You are about to leave Dashbrd to an external website. Dashbrd has no control over the content of
            this site. Are you sure you wish to continue?',
            'not_show' => 'Do not show this message again.',
        ],
        'refresh' => [
            'title' => 'Refresh your collection',
            'notice' => 'You can refresh data every 15 minutes.',
            'notice_wait' => 'Please wait. You can refresh data every 15 minutes.',
            'toast' => "We're updating information for your collection.",
        ],
    ],

    'nfts' => [
        'nft' => 'nft',
        'about_nft' => 'About NFT',
        'owned_by' => 'Owned by',
        'collection_image' => 'collection image',
        'menu' => [
            'properties' => 'Properties',
            'activity' => 'Activity',
        ],
    ],

    'reports' => [
        'title' => 'Submit a Report',
        'description' => "Thanks for looking out by reporting things that break the rules. Let us know what's happening and we'll receive the report.",
        'success' => "Thank you for your report. We'll review it and see if it breaks our ToS.",
        'failed' => 'Something went wrong. Please try again.',
        'throttle' => 'You have made too many requests. Please wait :time before reporting again.',
        'reported' => 'You have already reported this :model.',

        'reasons' => [
            'spam' => 'Spam',
            'violence' => 'Promoting Violence',
            'hate' => 'Hate',
            'inappropriate_content' => 'Inappropriate Content',
            'impersonation' => 'Impersonation',
            'trademark' => 'Trademark or Copyright',
            'selfharm' => 'Self-Harm',
            'harassment' => 'Harassment',
        ],
    ],

    'galleries' => [
        'title' => 'Galleries',
        'empty_title' => 'No galleries have been published yet. Once they do they will appear here.',
        'search' => [
            'loading_results' => 'Loading results...',
            'no_results' => 'We could not find anything matching your search criteria, please try again!',
            'placeholder' => 'Search by name or curator address',
            'placeholder_nfts' => 'Search by NFTs',
            'error' => 'Could not load search results. Please try again later.',
        ],
        'my_galleries' => [
            'title' => 'My Galleries',
            'subtitle' => 'Manage your galleries',
            'new_gallery' => 'New Gallery',
            'no_galleries' => 'You have not created any galleries yet. To create a gallery, click on the "Create Gallery" button.',
            'no_draft_galleries' => 'You have no draft galleries yet. To create a gallery, click on the "Create Gallery" button.',
            'succesfully_deleted' => 'Gallery successfully deleted',
            'successfully_created' => 'Gallery has been successfully created',
            'successfully_updated' => 'Gallery has been successfully updated',
            'new_gallery_no_nfts' => 'Creating a Gallery requires you to own an NFT.',
            'delete_modal' => [
                'title' => 'Delete Draft',
                'text' => 'Are you sure you want to delete the draft? Everything you\'ve done will be deleted and you won\'t be able to get it back.',
            ],
            'nfts_no_longer_owned' => 'NFTs no longer owned by this wallet have been removed from the draft”',
        ],
        'copy_gallery_link' => 'Copy Gallery Link',
        'my_nfts' => 'My NFTs',
        'value' => 'Value',
        'floor_price' => 'Floor Price',
        'nfts' => 'NFTs',
        'collections' => 'Collections',
        'galleries_count_simple' => '{0} galleries|{1} gallery|[2,*] galleries',
        'galleries_count' => '{0} :count Galleries|{1} :count Gallery|[2,*] :count Galleries',
        'collections_count_simple' => '{0} collections|{1} collection|[2,*] collections',
        'collections_count' => '{0} :count Collections|{1} :count Collection|[2,*] :count Collections',
        'nfts_count_simple' => '{0} NFTs|{1} NFT|[2,*] NFTs',
        'nfts_count' => '{0} :count NFTs|{1} :count NFT|[2,*] :count NFTs',
        'users_count_simple' => '{0} users|{1} user|[2,*] users',
        'users_count' => '{0} :count Users|{1} :count User|[2,*] :count Users',
        'featuring' => 'Featuring',
        'curated_by' => 'Curated by',
        'worth_about' => 'Worth About',
        'valued_at' => 'valued at',
        'from' => 'From',
        'most_popular_galleries' => 'Most Popular Galleries',
        'newest_galleries' => 'Newest Galleries',
        'most_valuable_galleries' => 'Most Valuable Galleries',
        'most_popular' => 'Most Popular',
        'newest' => 'Newest',
        'most_valuable' => 'Most Valuable',
        'create' => [
            'search_by_nfts' => 'Search by NFTs',
            'input_placeholder' => 'Enter gallery name',
            'title_too_long' => 'Gallery name must not exceed :max characters.',
            'already_selected_nft' => 'NFT already exists in this gallery',
            'nft_missing_image' => 'Only NFTs with images can be added to galleries',
            'nft_gallery_limit' => 'You can only add 16 NFTs per gallery',
            'gallery_cover' => 'Gallery Cover',
            'gallery_cover_description' => 'The cover is used for the card on the gallery list page. While the cover is not a requirement it will allow you to add personality and stand out from the crowd.',
            'gallery_cover_information' => 'Image dimensions must be at least 287px x 190px, with a max size of 2 MB (JPG, PNG or GIF)',
            'no_results' => 'We could not find anything matching your search criteria, please try again!',
            'templates' => [
                'cover' => 'Cover',
                'template' => 'Template',
                'select' => 'Select Gallery Template',
                'basic' => 'Basic Gallery',
                'coming_soon' => 'More Coming Soon',
            ],
            'load_more_collections_one' => 'Load {{count}} More Collection',
            'load_more_collections_other' => 'Load {{count}} More Collections',
            'load_more_nfts' => 'Load More NFTs',
            'can_purchase' => 'You can purchase NFTs with these top NFT Marketplaces:',
            'must_own_one_nft' => 'You must own at least one (1) NFT in order to create a gallery.',
            'back_to_galleries' => 'Back to Galleries',
            'draft_saved' => 'Draft Saved',
            'saving_to_draft' => 'Saving to draft',
            'drafts_limit_modal_title' => 'Draft Gallery Limit',
            'drafts_limit_modal_message' => 'You’ve hit your limit for draft galleries. While you can still make new galleries and publish them, they won’t be saved as drafts. To Free up space, you can either delete existing drafts or publish them.',
            'drafts_limit_modal_cancel' => 'Go to Drafts',
        ],
        'delete_modal' => [
            'title' => 'Delete Gallery',
            'confirmation_text' => 'Are you sure you want to delete the gallery? Deleting a Gallery is permanent, all associated views and likes will be lost.',
        ],
        'consists_of_collections' => '{0} This gallery consists of :count collections|{1} This gallery consists of :count collection|[2,*] This gallery consists of :count collections',
        'guest_banner' => [
            'title' => 'Craft the ultimate',
            'subtitle' => 'Pick your favorites, curate your gallery, & share it with the world.',
        ],
    ],

    'profile' => [
        'title' => 'Profile',
    ],

    'token_panel' => [
        'balance_tooltip' => 'Total percentage of the portfolio held in this token',
        'insufficient_funds' => 'Insufficient Balance',
        'error' => 'Dashbrd has failed to load token information. Please try again later.',
        'failed_to_retrieve_transactions' => 'We were unable to fetch your transactions.',
        'tabs' => [
            'transaction_history' => 'Transaction History',
            'history' => 'History',
            'market_data' => 'Market Data',
        ],
        'details' => [
            'current_price' => 'Current Price',
            'title' => 'Token Details',
            'market_cap' => 'Market Cap',
            'volume' => 'Daily Volume',
            'supply' => 'Minted Supply',
            'ath' => 'All-Time High',
            'atl' => 'All-Time Low',
        ],
        'chart' => [
            'failed' => 'Dashbrd has failed to load chart information. Please try again later.',
        ],
    ],

    'transaction_details_panel' => [
        'title' => 'Transaction Details',
        'details' => [
            'blockchain' => 'Blockchain',
            'timestamp' => 'Timestamp',
            'transaction_hash' => 'Transaction Hash',
            'transaction_fee' => 'Transaction Fee',
            'gas_price' => 'Gas Price',
            'gas_used' => 'Gas Used',
            'nonce' => 'Nonce',
        ],
    ],

    'send_receive_panel' => [
        'send' => [
            'labels' => [
                'token_and_amount' => 'Token and Amount',
                'destination_address' => 'Destination Address',
                'projected_fee' => 'Projected Fee',
            ],
            'placeholders' => [
                'enter_amount' => 'Enter Amount',
                'insert_recipient_address' => 'Insert Recipient Address',
                'projected_fee' => 'Projected Fee',
            ],
            'errors' => [
                'amount' => 'Insufficient Funds: You do not have enough to cover the amount + fee.',
                'destination' => 'Destination address is not correct. Check and input again.',
            ],
            'hints' => [
                'token_price' => 'Token Price',
            ],
            'fees' => [
                'Fast' => 'Fast',
                'Avg' => 'Avg',
                'Slow' => 'Slow',
            ],
            'search_dropdown' => [
                'placeholder' => 'Search token',
                'no_results' => 'No Results',
                'error' => 'Error occurred while searching tokens.',
            ],
            'transaction_time' => 'Transaction Time: ~{{ time }} minutes',
            'from' => 'From',
            'to' => 'To',
            'amount' => 'Amount',
            'fee' => 'Fee',
            'total_amount' => 'Total Amount',
            'waiting_message' => 'Review and verify the information on your MetaMask. Sign to send the transaction.',
            'waiting_spinner_text' => 'Waiting for confirmation...',
            'failed_message' => "It looks like something went wrong while sending your transaction. Press 'Retry' to make another attempt.",
        ],
        'receive' => [
            'alert' => 'Send only Polygon or Ethereum Network compatible tokens to this address or you could permanently lose your funds!',
        ],
    ],

    'settings' => [
        'title' => 'Settings',
        'sidebar' => [
            'general' => 'General',
            'notifications' => 'Notifications',
            'session_history' => 'Sessions History',
        ],
        'general' => [
            'title' => 'Settings',
            'subtitle' => 'Customize your App Experience',
            'currency' => 'Currency',
            'currency_subtitle' => 'Select your default currency which will be used throughout the app.',
            'time_date' => 'Time & Date',
            'time_date_subtitle' => 'Select how you want time and date be shown inside app.',
            'date_format' => 'Date Format',
            'time_format' => 'Time Format',
            'timezone' => 'Timezone',
            'set_defaults' => 'Set Defaults',
            'set_defaults_content' => 'Reverting to the default settings will remove any customizations previously made. Are you sure?',
            'save' => 'Save Settings',
            'saved' => 'Your settings have been successfully saved',
        ],
    ],

    'wallet' => [
        'title' => 'Wallet',
    ],

    'privacy_policy' => [
        'title' => 'Privacy Policy',
    ],

    'terms_of_service' => [
        'title' => 'Terms of Service',
    ],
];
