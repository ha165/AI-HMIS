<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Post::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $fields = $request->validate([
            "title" => "required|max:255",
            "body" => "required|max:255",
        ]);
        $post = Post::create($fields);
        return [
            "status" => "success",
            "message" => "Post created successfully",
            "post" => $post
        ];
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        return ["post" => $post];
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        $fields = $request->validate([
            "title" => "required|max:255",
            "body" => "required|max:255",
        ]);
        $post->update($fields);
        return [
            "status" => "success",
            "message" => "Post updated successfully",
            $post
        ];
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        $post->delete();
        return ["status" => "success", "message" => "Post deleted successfully"];
    }
}
