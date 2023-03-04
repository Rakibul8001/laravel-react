<?php

namespace App\Models;

use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Model;

class Variant extends Model
{
    protected $fillable = [
        'title', 'description'
    ];

    public function products(){
        return $this->belongsToMany(Product::class,'product_variants','variant_id','product_id');
    }

    public function product_variants(){
        return $this->belongsTo(ProductVariant::class,'product_id','variant_id');
    }
    

}
