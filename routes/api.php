<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

//Product
Route::get('/products', 'Api\ProductController@index');
Route::post('/products/filter', 'Api\ProductController@filter');
Route::post('/product/create', 'Api\ProductController@store');
Route::post('/product/update/{id}', 'Api\ProductController@update');
Route::get('/product/{id}','Api\ProductController@details');

Route::get('/variants', 'Api\VariantController@index');
