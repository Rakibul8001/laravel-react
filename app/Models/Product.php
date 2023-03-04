<?php

namespace App\Models;

use App\Models\Variant;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'title', 'sku', 'description'
    ];


    /**
     * Get all of the comments for the Product
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */

     //with children of children correct
    public function variants()
    {
        return $this->belongsToMany(Variant::class, 'product_variants','product_id','variant_id')->with('product_variants');
    }


}
