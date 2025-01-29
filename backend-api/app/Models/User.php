<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'phone',
        'profile_photo',
    ];
    protected $appends = ['profile_photo_url'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    public function roles()
    {
        return $this->belongsToMany(Roles::class, 'user_roles', 'user_id', 'role_id');
    }
    public function getRoleAttribute()
    {
        return $this->roles()->first()->name ?? 'patient';
    }
    public function appointments()
    {
        return $this->hasMany(Appointments::class);
    }

    public function shedules()
    /*************  ✨ Codeium Command ⭐  *************/
    /**
     * Get the URL to the user's profile photo.
     *
     * @return string
     */
    /******  0306081e-8a05-4b41-abf4-1bcbffdb24a8  *******/
    {
        return $this->hasMany(Schedules::class);
    }

    public function getProfilePhotoUrlAttribute()
    {
        return $this->profile_photo
            ? asset('storage/' . $this->profile_photo)
            : asset('default-avatat.png');
    }
}
