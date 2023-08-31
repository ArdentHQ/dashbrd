<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Http\Requests\Traits\UpdatesPrimaryWallet;
use App\Models\Wallet;
use App\Rules\ValidChain;
use App\Rules\WalletAddress;
use Closure;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SwitchAccountRequest extends FormRequest
{
    use UpdatesPrimaryWallet;

    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
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
            'address' => [
                'required',
                new WalletAddress(),
                function (string $attribute, mixed $value, Closure $fail) {
                    $wallet = Wallet::findByAddress($this->address);

                    if ($wallet === null || $wallet->user_id !== $this->user()->id) {
                        $fail(trans('auth.wallet.requires_signature'));
                    }
                },
            ],
            'chainId' => ['required', new ValidChain()],
        ];
    }

    public function failedValidation(Validator $validator)
    {
        auth()->logout();

        parent::failedValidation($validator);
    }
}
