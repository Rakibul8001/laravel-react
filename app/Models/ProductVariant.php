<?php

namespace App\Models;

use App\Models\Product;
use App\Models\Variant;
use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $guarded = ['id'];

    // public function variants(){
    //     return $this->hasMany(Variant::class);
    // }

    public function product(){
        return $this->belongsTo(Product::class,'product_id');
    }

}
