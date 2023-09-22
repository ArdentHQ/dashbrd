<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\DateFormat;
use App\Enums\ToastType;
use App\Support\Currency;
use App\Support\Timezone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class GeneralSettingsController extends Controller
{
    public function edit(Request $request): Response
    {
        return Inertia::render('Settings/General', [
            'title' => trans('metatags.settings.title'),
            'currencies' => Currency::all(),
            'dateFormats' => DateFormat::all(),
            'timezones' => Timezone::formatted(),
            'reset' => $request->boolean('reset'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'currency' => ['required', 'string', Rule::in(Currency::codes())],
            'date_format' => ['required', 'string', new Enum(DateFormat::class)],
            'time_format' => 'required|string|in:12,24',
            'timezone' => ['required', 'string', Rule::in(Timezone::all())],
        ]);

        $request->user()->extra_attributes->set([
            'currency' => $request->input('currency'),
            'date_format' => $request->input('date_format'),
            'time_format' => $request->input('time_format'),
            'timezone' => $request->input('timezone'),
        ]);

        $request->user()->save();

        return back()->toast(trans('pages.settings.general.saved'), ToastType::Success->value);
    }
}
