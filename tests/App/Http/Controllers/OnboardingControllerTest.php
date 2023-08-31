<?php

declare(strict_types=1);

it('shows the onboarding page if user has not onboarded', function () {
    $user = createUser(walletAttributes: [
        'onboarded_at' => null,
    ]);

    $response = $this->actingAs($user)->get(route('onboarding'));

    $response->assertStatus(200);
});

it('returns the onboarding status on ajax requests', function () {
    $user = createUser(walletAttributes: [
        'onboarded_at' => now(),
    ]);

    $response = $this->actingAs($user)->getJson(route('onboarding'));

    $response->assertJson([
        'onboarded' => true,
    ]);
});

it('redirects to dashboard if user has onboarded', function () {
    $user = createUser(walletAttributes: [
        'onboarded_at' => now(),
    ]);

    $response = $this->actingAs($user)->get(route('onboarding'));

    $response->assertRedirect(route('dashboard'));
});
