<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthController extends Controller
{
   public function register(request $request) {
     return "register"; 
   }
   public function login(request $request) {
     return "login";
   }
   public function logout(request $request) {
     return "logout";
   }
}  

