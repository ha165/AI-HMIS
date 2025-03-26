<?php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
  public function register(Request $request)
  {
    $fields = $request->validate([
      'first_name' => 'required|max:255|regex:/^[a-zA-Z\s]+$/',
      'last_name' => 'required|max:255|regex:/^[a-zA-Z\s]+$/',
      'email' => 'required|email|unique:users,email',
      'password' => [
        'required',
        'confirmed',
        Password::min(8)
          ->mixedCase()
          ->numbers()
          ->symbols()
      ],
      'phone' => 'required|regex:/^254\d{9}$/',
      'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    ]);

    // Handle Profile Photo Upload
    if ($request->hasFile('profile_photo')) {
      $profilePhotoPath = $request->file('profile_photo')->store('profile_photos', 'public');
      $fields['profile_photo'] = $profilePhotoPath;
    }

    $fields['password'] = Hash::make($fields['password']);
    $fields['role'] = 'patient';

    $user = User::create($fields);
    $user->refresh();

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
      'user' => $user,
      'role' => $user->role,
      'token' => $token,
    ], 201);
  }

  public function login(Request $request)
  {
    $request->validate([
      'email' => 'required|email|exists:users,email',
      'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
      return response()->json([
        'errors' => [
          'email' => ['The provided credentials are incorrect'],
        ]
      ], 401);
    }

    $token = $user->createToken('auth_token');

    return response()->json([
      'user' => $user,
      'role' => $user->role,
      'token' => $token->plainTextToken,
    ]);
  }

  public function logout(Request $request)
  {
    $request->user()->tokens()->delete();

    return response()->json([
      'message' => 'Logged out successfully',
    ]);
  }
}