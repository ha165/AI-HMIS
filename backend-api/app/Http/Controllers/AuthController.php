<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AuthController extends Controller
{
   public function register(request $request) {
     $fields = $request->validate([
       'name' => 'required|max:255',
       'email' => 'required|email|unique:users',
       'password' => 'required|min:8|confirmed'
     ]);
     $user = User::create($fields);

     $token = $user->createToken($request->name);

     return [
       'user' => $user,
       'token' => $token
     ];
   }
   public function login(request $request) {
     return "login";
   }
   public function logout(request $request) {
     return "logout";
   }
}  

