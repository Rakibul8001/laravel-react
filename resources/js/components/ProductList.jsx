import React, { useState, useEffect, useCallback,Fragment } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { format } from 'date-fns';
import { BrowserRouter, Routes, Route,Link } from "react-router-dom";
import Edit from "./Edit";

function ProductList() {
    const [products,setProducts]=useState([]);
    const [loading,setLoading]= useState(true);
    // console.log(products);

    const fetchProducts = useCallback(async()=>{
        setLoading(true);
        await axios.get('/api/products')
        .then((res)=>{
            setProducts(res.data?.products);
            setLoading(false);
        })
        .catch(err=>console.log(err))
    },[]);

    useEffect(()=>{
        fetchProducts();
    },[]);



    const [title,setTitle]= useState("");
    const [date,setDate] = useState("");
    const [price_from,setPriceFrom] = useState(0);
    const [price_to,setPriceTo] = useState(10000);

    //submit form for filtering
    const onSubmitFilter = async(e)=>{
        e.preventDefault();
        let subscribed = true;
        await axios.post('/api/products/filter',{title,date,price_from,price_to})
        .then((res)=>{
            if(subscribed){
                setProducts(res.data?.products);
            }
        })
        .catch((err)=> console.log(err));
    }


  return (

    <Fragment>
        <form className="card-header" onSubmit={onSubmitFilter}>
            <div className="form-row justify-content-between">
            <div className="col-md-2">
                <input type="text" name="title" value={title} onChange={(e)=>{setTitle(e.target.value)}} />
            </div>
            <div className="col-md-2">
                <select name="variant" id="" className="form-control"></select>
            </div>
            <div className="col-md-3">
                <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text">Price Range</span>
                </div>
                <input
                    type="number"
                    name="price_from"
                    defaultValue={price_from}
                    onChange={(e)=>{setPriceFrom(e.target.value)}}
                    aria-label="First name"
                    placeholder="From"
                    className="form-control"
                />
                <input
                    type="number"
                    name="price_to"
                    defaultValue={price_to}
                    onChange={(e)=>{setPriceTo(e.target.value)}}
                    aria-label="Last name"
                    placeholder="To"
                    className="form-control"
                />
                </div>
            </div>
            <div className="col-md-2">
                <input
                type="date"
                name="date"
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                placeholder="Date"
                className="form-control"
                />
            </div>
            <div className="col-md-1">
                <button type="submit" className="btn btn-primary float-right">
                <i className="fa fa-search" />
                </button>
            </div>
            </div>
        </form>
        <div className="card-body">
            <div className="table-response">
            <table className="table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Variant</th>
                    <th width="150px">Action</th>
                </tr>
                </thead>
                <tbody>

                {!loading && products.map((product,index)=>(<Fragment key={index}>
                <tr>
                    <td>{index+1}</td>
                    <td>
                    {product?.title} <br /> Created at :{product?.created_at}
                    </td>
                    <td>{product?.description}</td>
                    <td>
                    <dl
                        className="row mb-0"
                        style={{ height: 80, overflow: "hidden" }}
                        id="variant"
                    >
                        <dt className="col-sm-3 pb-0">SM/ Red/ V-Nick</dt>
                        <dd className="col-sm-9">
                        <dl className="row mb-0">
                            <dt className="col-sm-4 pb-0">
                            Price : {"{"}
                            {"{"} number_format(200,2) {"}"}
                            {"}"}
                            </dt>
                            <dd className="col-sm-8 pb-0">
                            InStock : {"{"}
                            {"{"} number_format(50,2) {"}"}
                            {"}"}
                            </dd>
                        </dl>
                        </dd>
                    </dl>
                    <button
                        onClick="$('#variant').toggleClass('h-auto')"
                        className="btn btn-sm btn-link"
                    >
                        Show more
                    </button>
                    </td>
                    <td>
                    <div className="btn-group btn-group-sm">
                        <a
                        href={`/product/${product?.id}/edit`}
                        className="btn btn-success"
                        >
                        Edit
                        </a>
                    
                    </div>
                    </td>
                </tr>

                </Fragment>))}

                </tbody>
            </table>
            </div>
        </div>
        <div className="card-footer">
            <div className="row justify-content-between">
            <div className="col-md-6">
                <p>Showing 1 to 10 out of 100</p>
            </div>
            <div className="col-md-2"></div>
            </div>
        </div>
        
        </Fragment>
  )
}

export default ProductList;

const element = document.getElementById("productList");

if (element) {
    ReactDOM.render(
        <ProductList />
    , element);
}