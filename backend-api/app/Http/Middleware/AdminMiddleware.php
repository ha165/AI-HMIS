<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Check if the user is an admin
        if (!$request->user() || !$request->user()->hasRole('admin')) {
            return response()->json([
                'error' => 'Unauthorized. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
