<?php

declare(strict_types=1);

namespace App\Http\Requests\Auth;

use App\Rules\ValidChain;
use App\Support\Facades\Signature;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SignMessageRequest extends FormRequest
{
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
            'chainId' => ['required', new ValidChain()],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @return string
     */
    public function getMessage()
    {
        $nonce = Signature::nonce();

        Signature::storeSessionNonce($this->chainId, $nonce);

        return Signature::buildSignMessage($nonce);
    }
}
