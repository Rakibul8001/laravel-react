<?php

namespace App\Http\Controllers\Api;

use Exception;
use App\Models\Product;
use App\Models\Variant;
use Illuminate\Http\Request;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;

class ProductController extends Controller
{
    //Show product list
    public function index(){
        $products = DB::table('products')->get();

        return response()->json([
            'result'=>'success',
            'products'=>$products
        ]);
    }

    //Filter products
    public function filter(Request $request){

        if($request->title && $request->date && $request->price_from && $request->price_to ){
            $products = DB::table('products')
            ->where('products.title','LIKE','%'.$request->title.'%')
            ->where('products.created_at','<=', date('Y-m-d',strtotime($request->date)).' 00:00:00')
            ->where('product_variant_prices.price','>=', $request->price_from)
            ->where('product_variant_prices.price','<=', $request->price_to)
            ->join('product_variant_prices','products.id','=','product_variant_prices.product_id')
            ->get();
        }
        else if( $request->price_from && $request->price_to){
            $products = DB::table('products')
            ->where('product_variant_prices.price','>=', $request->price_from)
            ->where('product_variant_prices.price','<=', $request->price_to)
            ->join('product_variant_prices','products.id','=','product_variant_prices.product_id')
            ->get();
        }
        else if( $request->title || $request->date || $request->price_from || $request->price_to ){
            $products = DB::table('products')
            ->where('products.title','LIKE','%'.$request->title.'%')
            ->orWhere('products.created_at','<=', date('Y-m-d',strtotime($request->date)).' 00:00:00')
            ->orWhere('product_variant_prices.price','>=', $request->price_from)
            ->orWhere('product_variant_prices.price','<=', $request->price_to)
            ->join('product_variant_prices','products.id','=','product_variant_prices.product_id')
            ->get();
           
        }
        else{
            $products = DB::table('products')->get();
        }


        return response()->json([
            'result'=>'success',
            'products'=>$products
        ]);
    }

    //store Product
    public function store(Request $request){
        try{
            //store data into products table
            $product = Product::create($request->all());

            //store data into product_variants table, if has product variant and tags
            $variantsArr=[];
            if(count($request->product_variant) > 0){
                foreach($request->product_variant as $variant){
                    if(count($variant['tags']) > 0){
                        foreach($variant['tags'] as $tag){
                            $variantsArr[]=array(
                                'variant'=> $tag,
                                'variant_id'=>$variant['option'],
                                'product_id'=>$product->id,
                                'created_at'=>date('Y-m-d H:i:s'),
                                'updated_at'=>date('Y-m-d H:i:s'),
                            );
                        }
                    }
                }
            }

            if(count($variantsArr) > 0){
                DB::table('product_variants')->insert($variantsArr);
            }


            $attrValue = $product->with('variants')->get();
            var_dump($attrValue);

            //store product_variant_prices

            $attributes_ids = DB::table('product_variants')
            ->select('variant_id')
            ->where('product_id',$product->id)
            ->groupBy('variant_id')
            ->get();

            $attributes_idsArr = [];

            foreach($attributes_ids as $newId){
                $attributes_idsArr[]=$newId->variant_id;
            }


            $product_variants = DB::table('product_variants')
                ->where('variant_id',$attributes_idsArr[0])
                ->where('product_id',$product->id)
                ->get();


            $choiceArr=[];
            //collect data from product_variants for each variant and multiple attributes
            foreach($product_variants as $key=>$choiceOne){

                if(count($attributes_idsArr)>1){
                    $attributes = DB::table('product_variants')->where('product_id',$product->id)
                        ->where('variant_id',$attributes_idsArr[1])
                        ->get();

                        foreach($attributes as $choiceTow){

                            if(count($attributes_idsArr)>2){
                                $third_attr = DB::table('product_variants')->where('product_id',$product->id)
                                        ->where('variant_id',$attributes_idsArr[2])
                                        ->get();
    
                                foreach($third_attr as $choiceThree){
                                    $choiceArr[]=array(
                                        'product_variant_one'=>$choiceOne->id,
                                        'product_variant_two'=> $choiceTow->id,
                                        'product_variant_three'=> $choiceThree->id,
                                        'price'=>$request->product_variant_prices[$key]['price'],
                                        'stock'=>$request->product_variant_prices[$key]['stock'],
                                        'product_id'=>$product->id,
                                        
                                    );
                                }
    
                            }
                            else{
                                $choiceArr[]=array(
                                    'product_variant_one'=>$choiceOne->id,
                                    'product_variant_two'=> $choiceTow->id,
                                    'price'=>$request->product_variant_prices[$key]['price'],
                                    'stock'=>$request->product_variant_prices[$key]['stock'],
                                    'product_id'=>$product->id,
                                    
                                );
    
                            }
                        
                        }

                }
                else{
                    $choiceArr[]=array(
                        'product_variant_one'=>$choiceOne->id,
                        'price'=>$request->product_variant_prices[$key]['price'],
                        'stock'=>$request->product_variant_prices[$key]['stock'],
                        'product_id'=>$product->id,
                        
                    );

                }
           
 
            }

            DB::table('product_variant_prices')->insert($choiceArr); //inserting product_variant_prices

            return response()->json([
                'result'=>'success',
                'product'=>$product,
                'product_variant'=>$variantsArr
            ]);
        }
        catch(\Exception $e){
            return response()->json([
                'error'=>$e->getMessage(),
                'message'=>'something went wrong !'
            ]);
        }

    }

    //product update
    public function update(Request $request){
        $product = Product::where('id',$request->id)->first();
        
        $product->title = $request->title;
        $product->sku = $request->sku;
        $product->description = $request->description;
        $product->save();

        return response()->json([
            'result'=>'success',
            'product'=>$product
        ]);
    }

    //Single product info and variants , options, tags
    public function details(Request $request){
        $product = DB::table('products')->where('id',$request->id)->first();

        $product_variants_ids = DB::table('product_variants')
                ->select('variant_id')
                ->where('product_variants.product_id',$request->id)
                ->join('variants', 'product_variants.variant_id', '=', 'variants.id')
                ->groupBy('variant_id')
                ->get();

        $variantArr=[];
        $attributes=[];

        foreach($product_variants_ids as $key=>$value){
            $variant = DB::table('variants')->where('id','=',$value->variant_id)->first();

            $variantArr[]=array(
                'variant_id'=>$variant->id,
                'title'=>$variant->title,
            );

            $attr = DB::table('product_variants')->select('id','variant')
                ->where('product_id',$product->id)
                ->where('variant_id',$variant->id)
                ->get();
            $attributes[]=$attr;

        }
        

        return response()->json([
            'result'=>'success',
            'product'=>$product,
            'product_variants_ids'=>$product_variants_ids,
            'variants'=> $variantArr,
            'attributes'=> $attributes
        ]);
    }


}
