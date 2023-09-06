<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Requests\Traits\UpdatesPrimaryWallet;
use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use App\Rules\WalletSignature;
use App\Support\Facades\Signature;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class LoginRequest extends FormRequest
{
    use UpdatesPrimaryWallet;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, (Rule | mixed[] | string)>
     */
    public function rules(): array
    {
        return [
            'address' => ['required', new WalletAddress()],
            // 'signature' => ['required', new WalletSignature()],
            'chainId' => ['required', new ValidChain()],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $credentials = $this->getAuthParams();
        // $nonce = $credentials['nonce'] ?? null;

        // if ($nonce === null) {
        //     report(new RuntimeException('Nonce error is back.'));

        //     throw ValidationException::withMessages([
        //         'address' => trans('auth.session_timeout'),
        //     ]);
        // }

        if (! Auth::attempt($credentials, remember: true)) {
            throw ValidationException::withMessages([
                'address' => trans('auth.failed'),
            ]);
        }

        $this->updatePrimaryWallet();

        // Signature::forgetSessionNonce($this->chainId);
    }

    /**
     * @return array<string, (Rule | mixed[] | string)>
     */
    private function getAuthParams(): array
    {
        // $nonce = Signature::getSessionNonce($this->chainId);

        return [
            'address' => $this->address,
            // 'signature' => $this->signature,
            'chainId' => $this->chainId,
            // 'nonce' => $nonce,
            // Passing the `userId` in case is logged so we can associate the wallet
            // to a existing user on the web3 auth provider
            'userId' => $this->user()?->id,
            // Passing the user locale information from frontend...
            'timezone' => $this->input('tz', 'UTC'),
            'locale' => $this->input('locale', 'en-US'),
        ];
    }
}
