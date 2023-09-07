<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use App\Rules\WalletSignature;
use App\Support\Facades\Signature;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class SignRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
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
            'signature' => ['required', new WalletSignature()],
            'chainId' => ['required', new ValidChain()],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function sign(): void
    {
        $credentials = $this->getAuthParams();
        $nonce = $credentials['nonce'] ?? null;

        $wallet = $this->wallet();

        if ($nonce === null || $wallet === null) {
            throw ValidationException::withMessages([
                'address' => trans('auth.session_timeout'),
            ]);
        }

        $verified = Signature::verify(
            signature: $credentials['signature'],
            address: $credentials['address'],
            message: Signature::buildSignMessage($credentials['nonce'])
        );

        if (! $verified) {
            Signature::setWalletIsNotSigned($wallet->id);

            throw ValidationException::withMessages([
                'address' => trans('auth.failed'),
            ]);
        }

        Signature::setWalletIsSigned($wallet->id);

        Signature::forgetSessionNonce($credentials['chainId']);
    }

    /**
     * @return array<string, string>
     */
    private function getAuthParams(): array
    {
        $nonce = Signature::getSessionNonce($this->chainId);

        return [
            'address' => $this->address,
            'signature' => $this->signature,
            'chainId' => $this->chainId,
            'nonce' => $nonce,
        ];
    }
}
