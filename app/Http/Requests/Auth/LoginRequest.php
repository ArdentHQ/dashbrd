<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Requests\Traits\UpdatesPrimaryWallet;
use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

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

        if (! Auth::attempt($credentials, remember: true)) {
            throw ValidationException::withMessages([
                'address' => trans('auth.failed'),
            ]);
        }

        $this->updatePrimaryWallet();
    }

    /**
     * @return array<string, (Rule | mixed[] | string)>
     */
    private function getAuthParams(): array
    {
        return [
            'address' => $this->address,
            'chainId' => $this->chainId,
            // Passing the `userId` in case is logged so we can associate the wallet
            // to a existing user on the web3 auth provider
            'userId' => $this->user()?->id,
            // Passing the user locale information from frontend...
            'timezone' => $this->input('tz', 'UTC'),
            'locale' => $this->input('locale', 'en-US'),
        ];
    }
}
