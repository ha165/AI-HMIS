<?php 
namespace App\Http\Controllers;

use App\Models\Roles;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
  public function register(Request $request)
  {
    $fields = $request->validate([
      'first_name' => 'required|max:255',
      'last_name' => 'required|max:255',
      'email' => 'required|email|unique:users,email',
      'password' => 'required|min:8|confirmed',
    ]);

    // Hash the password before saving
    $fields['password'] = Hash::make($fields['password']);

    // Create user
    $user = User::create($fields);

    $patientRole = Roles::where('name', 'patient')->first();
    if ($patientRole) {
        $user->roles()->attach($patientRole->id);
    }

    // Create token
    $token = $user->createToken('auth_token');

    return response()->json([
      'user' => $user,
      'token' => $token->plainTextToken,
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

    // Create token with a generic name
    $token = $user->createToken('auth_token');

    return response()->json([
      'user' => $user,
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
