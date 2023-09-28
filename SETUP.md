# Setup

This document will get you up to speed with the setup requirements to run Dashbrd locally and start development on it.

> [!NOTE]
> Please read through the entire document, as it includes useful information related to required API keys, additional development insights and customisations in terms of enabled features.

## Prerequisites

Dashbrd relies on the following, so make sure you have these installed before continuing:

-   Composer 2
-   PostgreSQL 14+
-   PHP 8.2+
-   Node 18+
-   Redis
-   pnpm
-   Laravel Valet or Homestead to ease development

## Environment Setup

With the prerequisits installed, let's get to

-   Clone this repository and `cd` into the directory
-   Install composer packages with `composer install`
-   Install node packages with `pnpm`
-   Run `cp .env.example .env`
-   Edit your `.env` file to update the database credentials and anything else that you may need
-   Setup an application key with `php artisan key:generate`
-   Run migrations with either `composer db:dev` (for development, make sure to set `LOCAL_TESTING_ADDRESS=`) or `composer db:bare` if you need just the basics
-   Run `php artisan horizon` to process jobs (e.g. FetchToken)
-   Run `php artisan schedule:work -v` to periodically update balances

If you're using [Laravel Valet](https://laravel.com/docs/10.x/valet), you can now link your app with `valet link`.
Run `pnpm dev` to build the development files and navigate to `dashbrd.test` afterwards to see the application in
action. Do not navigate to the `localhost` URL that vite shows in your terminal, as that will refer to the hot-reloading
server and not the actual application.

> [!NOTE]
> For testing purposes, you can set `LOCAL_TESTING_ADDRESS=` in combination with `APP_ENV=testing_e2e` to any valid address to imitate ownership. This makes it easier to test specific circumstances by logging you in as the given address

## Administration Panel

Dashbrd provides you with an administration panel based on [Filament v3](https://filamentphp.com/), where you can see and manage different resources, such as wallets and reports. From the database perspective, "Admin Users" are no different than users connected through the app. The only difference is that Admin Users have email and password associated to them, so they can sign in to Admin panel, and they must have a role with sufficient permissions (`admin:access`).

When you run `composer db:dev` command, you'll notice there are several users seeded in the database. You can use them to sign into the Administration Panel. Simply visit `/admin` URL and you'll be prompted with a sign-in form. You can fine-tune initial admin users by modifying `config/permission.php` file:

```php
'user_role' => [
    'john@example.com' => Role::Superadmin->value,
    'steve@example.com' => Role::Superadmin->value,
],
```

You can always create a new admin user by running `php artisan make:admin` CLI command.

## Reports

When a model gets reported (Gallery, Collection, NFT), this creates an entry in the Admin panel to review. Depending on your needs, you may want to be notified as well to quickly respond to new reports. For this reason, it's possible to add a webhook to get reports pushed to Slack as well. You can adjust the `.env` as follows to achieve this:

```bash
SLACK_REPORTS_WEBHOOK_URL=your-webhook-url
SLACK_REPORTS_ENABLED=true
```

More information on setting up a webhook on Slack can be found [here](https://api.slack.com/messaging/webhooks). This will provide you with a webhook URL to use in your `.env`.

## API Keys

Dashbrd relies on a variety of 3rd party APIs to retrieve its data. For each of these, you'll need an API key to continue. Luckily there are free tiers available for each of them to get you up and running quickly.

### Alchemy

For Alchemy you will need to setup an account and create keys for both Polygon and Ethereum. They have a [quick start guide](https://docs.alchemy.com/docs/alchemy-quickstart-guide) available with information on how to do that. Once you have your apps setup and keys generated, add them to your `.env` as follows:

```bash
ALCHEMY_API_KEY_POLYGON_MAINNET=your-polygon-mainnet-api-key
ALCHEMY_API_KEY_POLYGON_TESTNET=your-polygon-testnet-api-key
ALCHEMY_API_KEY_ETHEREUM_MAINNET=your-ethereum-mainnet-api-key
ALCHEMY_API_KEY_ETHEREUM_TESTNET=your-ethereum-testnet-api-key
```

Keep in mind that you only need to create apps for environments you will use, so if you're not using testnets you don't have to provide the API key for those.

### Moralis

For Moralis you can get your API key at this [link](https://docs.moralis.io/web3-data-api/get-your-api-key). Once you have one, set it in the `.env` as follows:

```bash
MORALIS_API_KEY=your-api-key
MORALIS_API_ENDPOINT=https://deep-index.moralis.io/api/v2/
```

### Mnemonic

Another data provider is Mnemonic, for which they provide a [first steps](https://docs.mnemonichq.com/docs/first-steps) guide on how to sign up and create an API key. With the key available, add it to your `.env` as follows:

```bash
MNEMONIC_API_KEY=your-api-key
```

### Opensea

For Opensea you can get your API by following the instructions at this [link](https://docs.opensea.io/reference/api-keys). Once you have one, set it in the `.env` as follows:

```bash
OPENSEA_API_KEY=your-api-key
```

### Coingecko

Coingecko is used as a data provider for token prices. Their free tier does not require an API key, but if you're a pro user you can set it as follows in your `.env` (but it's not a requirement for Dashbrd to work):

```bash
COINGECKO_API_KEY=your-pro-api-key
```

## Feature Customization (Optional)

You have the ability to disable certain features in Dashbrd as per your requirements.

The following features can be optionally disabled by setting their values to `false` in the .env file.

```
PORTFOLIO_ENABLED=true # Wallet/Portfolio Feature
GALLERIES_ENABLED=true # Galleries Feature
COLLECTIONS_ENABLED=true # Collections Feature
```

Notice that after updating your `.env` file with the desired configurations, you need to purge the cache for the changes to take effect. This is accomplished by running the following command:

```bash
php artisan pennant:purge
```

Ensure you always have **at least one feature enabled** in your application to ensure its proper functioning. Also, remember to run the `php artisan pennant:purge` command each time you make changes to the `.env` file.

## Storybook

You can view the current set of components by running `pnpm storybook` and navigating to the storybook URL. This will
give you an interactive overview of the elements that have been implemented.

## Development Stack

Dashbrd is making use of the LITTR Stack. This means it consists of:

-   [Laravel](https://laravel.com/) - used as the backend, aimed at Laravel 10 + PHP 8.2+
-   [Inertia.js](https://inertiajs.com/) - for easier communication between the backend and frontend frameworks
-   [Tailwind CSS](https://tailwindcss.com/) - the CSS framework used throughout the application to keep our styles consistent and reusable
-   [TypeScript](https://www.typescriptlang.org/) - keeps our codebase clean and more expressive by utilizing types in JavaScript
-   [React](https://react.dev/) - used as the frontend package to make Dashbrd pretty and responsive

In addition to the above frameworks, we also utilize [Laravel Data](https://github.com/spatie/laravel-data) together with [TypeScript Transformer](https://github.com/spatie/typescript-transformer) to allow for easy type generation and to avoid rewriting classes in various locations. This generates TypeScript files when running `php artisan typescript:transform`

We have a [basic PHP setup guide available in our Wiki](https://github.com/ArdentHQ/dashbrd/wiki/%5BGuide%5D-PHP-Setup) as well for those that are new to PHP development.

## Commands

To get you up to speed, some useful commands are listed below. You can run individual commands by having a look at the `app/Console/Kernel.php` file that highlights scheduled jobs. Each of those link to commands that you can also run manually with `php artisan`.

-   `composer db:bare` - minimal setup with no users or tokens
-   `composer db:dev` - setup with some tokens and NFTs seeded to the address provided in `LOCAL_TESTING_ADDRESS=`
-   `composer db:live` - setup with additional tokens and NFTs based on data provided in the live data dump. You can create your own data dump by running `composer db:live:dump`
-   `composer db:live:dump` - dump data based on the `LOCAL_TESTING_ADDRESS=` to turn it into a data dump that can be used in the live data seeder. Useful if you want to test with data from specific address(es) without having to perform live requests each time you connect it. This relies on the `wallets:live-dump` command, where you can specify the addresses used to fetch data for
-   `php artisan nfts:live-dump` - allows you to dump data for a list of collections to prefetch the data and allowing to seed it to avoid calls to 3rd party APIs when testing
