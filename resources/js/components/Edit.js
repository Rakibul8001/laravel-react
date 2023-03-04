import axios from "axios";
import React, { Fragment, useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { useDropzone } from "react-dropzone";
import { TagsInput } from "react-tag-input-component";


const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16
};

const thumb = {
    display: "inline-flex",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    width: 100,
    height: 100,
    padding: 4,
    boxSizing: "border-box"
};

const thumbInner = {
    display: "flex",
    minWidth: 0,
    overflow: "hidden"
};

const img = {
    display: "block",
    width: "auto",
    height: "100%"
};

const Edit = () => {
  var urlpath = window.location.pathname;
  var splitPath = urlpath.split('/')
  const id = splitPath[2];
    // console.log(id);
    const [variants, setVariants] = useState([]);
    const [formData, setFormData] = useState({
        product_name: "",
        product_sku: "",
        description: "",
        images: [],
        product_variant: [],
        product_variant_prices: []
    });

    console.log(formData);

    const onDrop = useCallback(acceptedFiles => {
        const images = acceptedFiles.map(file =>
            Object.assign(file, {
                preview: URL.createObjectURL(file)
            })
        );
        setFormData(prevState => ({
            ...prevState,
            images: [...prevState.images, ...images]
        }));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: {
            "image/*": []
        },
        onDrop
    });

    // on change form input
    const onInputChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // handle variant change
    const handleVariantChange = (index, value) => {
        setFormData(prevState => ({
            ...prevState,
            product_variant: prevState.product_variant.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          option: value
                      }
                    : item
            )
        }));
    };

    // handle variant remove
    const handleVariantRemove = index => {
        setFormData(prevState => ({
            ...prevState,
            product_variant: prevState.product_variant.filter(
                (item, itemIndex) => itemIndex !== index
            )
        }));
    };

    // handle variant tags add
    const handleVariantTagAdd = (index, tags) => {
        setFormData(prevState => ({
            ...prevState,
            product_variant: prevState.product_variant.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          tags
                      }
                    : item
            )
        }));
    };

    // handle variant price change
    const handleVariantPriceChange = (index, updatedItem) => {
        setFormData(prevState => ({
            ...prevState,
            product_variant_prices: prevState.product_variant_prices.map(
                (item, itemIndex) => (itemIndex === index ? updatedItem : item)
            )
        }));
    };

    // combination algorithm
    const getCombn = (arr, pre) => {
        pre = pre || "";
        if (!arr.length) {
            return pre;
        }

        let ans = arr[0].reduce(function(ans, value) {
            return ans.concat(getCombn(arr.slice(1), pre + value + "/"));
        }, []);
        return ans;
    };

    // it will push a new object into product variant
    const newVariant = () => {
        let all_variants = variants.map(el => el.id);
        let selected_variants = formData.product_variant.map(el => el.option);
        let available_variants = all_variants.filter(
            entry1 => !selected_variants.some(entry2 => entry1 == entry2)
        );

        setFormData(prevState => ({
            ...prevState,
            product_variant: [
                ...prevState.product_variant,
                {
                    option: available_variants[0],
                    tags: []
                }
            ]
        }));
    };

    // check the variant and render all the combination
    const checkVariant = product_variant => {
        let tags = [];
        const product_variant_prices = [];
        formData.product_variant.forEach(item => {
            tags.push(item.tags);
        });

        const comn = getCombn(tags);
        if (Array.isArray(comn)) {
            comn.forEach(item => {
                product_variant_prices.push({
                    title: item,
                    price: 0,
                    stock: 0
                });
            });
        }

        setFormData(prevState => ({ ...prevState, product_variant_prices }));
    };



    useEffect(() => {
        axios.get("/api/variants").then(response => {
            setFormData(prevState => ({
                ...prevState,
                product_variant: [
                    {
                        option: response.data[0].id,
                        tags: []
                    }
                ]
            }));
            setVariants(response.data);
        });
    }, []);

    // check product_variant_price when product_variant changed
    useEffect(() => {
        checkVariant();
    }, [formData.product_variant]);


    const thumbs = formData.images.map(file => (
        <div style={thumb} key={file.name}>
            <div style={thumbInner}>
                <img
                    src={file.preview}
                    style={img}
                    // Revoke data uri after image is loaded
                    onLoad={() => {
                        URL.revokeObjectURL(file.preview);
                    }}
                />
            </div>
        </div>
    ));


    const [title,setTitle]=useState("");
    const [sku,setSku]=useState("");
    const [description,setDescription]=useState("");
    const [variantsArr,setVariantsArr]=useState([]);

    useEffect(()=>{
        variantsArr.map((option,index)=>{
            setFormData(prevState => ({
                product_variant: [
                    {
                        option: option.variant_id,
                        tags:[...formData.product_variant[index].tags.push(`${option.title}`)]
                    }
                ]
            }));
        })
    },[variantsArr])

    const [loading,setLoading] = useState(true);

    const fetchProductData=useCallback(async()=>{
      let isSubscribe = true;
      setLoading(true);
      await axios.get(`/api/product/${id}`)
      .then((res)=>{
        if(isSubscribe){
            let result = res.data?.variants;
            variantsArr.push(...result);
   
          setTitle(res.data?.product?.title);
          setSku(res.data?.product?.sku);
          setDescription(res.data?.product?.description);

        setLoading(false);

        }
      })
      .catch((err)=>{
        console.log(err);
      });

      return ()=> isSubscribe=false;

    },[id])

    useEffect(()=>{
      fetchProductData();
    },[fetchProductData]);


    //product update form
    const saveProduct = async() => {
      let product = {
          title:title,
          sku:sku,
          description:description,
      };

     await axios
          .post(`/api/product/update/${id}`, {...product})
          .then(response => {
              console.log(response.data);
              window.location.reload();
          })
          .catch(error => {
              console.log(error);
          });

    //   console.log(product);
  };

    return (
        <section>

        {!loading && (<Fragment>
          <div className="row">
                <div className="col-md-6">
                    <div className="card shadow mb-4">
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="">Product Name</label>
                              
                                  <input
                                    type="text"
                                    placeholder="Product Name"
                                    name="title"
                                    defaultValue={title}
                                    onChange={(e)=>{setTitle(e.target.value)}}
                                    className="form-control"
                                   
                                />
                            

                            </div>
                            <div className="form-group">
                                <label htmlFor="">Product SKU</label>
                                <input
                                    type="text"
                                    placeholder="Product Name"
                                    className="form-control"
                                    name="sku"
                                    defaultValue={sku}
                                    onChange={(e)=>{setSku(e.target.value)}}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="">Description</label>
                                <textarea
                                    id=""
                                    cols="30"
                                    rows="4"
                                    className="form-control"
                                   name="description"
                                   defaultValue={description}
                                   onChange={(e)=>{setDescription(e.target.value)}}
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Media
                            </h6>
                        </div>
                        <div
                            className="card-body border"
                            {...getRootProps({ className: "dropzone" })}
                        >
                            <input className="p-5" {...getInputProps()} />
                            <p className="p-5 text-center m-3 border">
                                Drop files here to upload
                            </p>
                        </div>
                        <aside style={thumbsContainer}>{thumbs}</aside>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">
                                Variants
                            </h6>
                        </div>
                        <div className="card-body">
                            {formData.product_variant.map((item, index) => (
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="">Option</label>
                                            <select
                                                className="form-control"
                                                selected={0}
                                                onChange={e =>
                                                    handleVariantChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                {variants.map(variant => (
                                                    <option value={variant.id}>
                                                        {variant.title}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="form-group">
                                            <label
                                                className="float-right text-primary"
                                                style={{
                                                    cursor: "pointer"
                                                }}
                                                onClick={() =>
                                                    handleVariantRemove(index)
                                                }
                                            >
                                                Remove
                                            </label>
                                            <label>.</label>
                                            <TagsInput
                                                value={item.tags}
                                                onChange={_tags =>
                                                    handleVariantTagAdd(
                                                        index,
                                                        _tags
                                                    )
                                                }
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="card-footer">
                            <button
                                className="btn btn-primary"
                                onClick={newVariant}
                            >
                                Add another option
                            </button>
                        </div>

                        <div className="card-header text-uppercase">
                            Preview
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <td>Variant</td>
                                            <td>Price</td>
                                            <td>Stock</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.product_variant_prices.map(
                                            (variant_price, index) => (
                                                <tr>
                                                    <td>
                                                        {variant_price.title}
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                variant_price.price
                                                            }
                                                            onChange={e =>
                                                                handleVariantPriceChange(
                                                                    index,
                                                                    {
                                                                        ...variant_price,
                                                                        price:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={
                                                                variant_price.stock
                                                            }
                                                            onChange={e =>
                                                                handleVariantPriceChange(
                                                                    index,
                                                                    {
                                                                        ...variant_price,
                                                                        stock:
                                                                            e
                                                                                .target
                                                                                .value
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                className="btn btn-lg btn-primary"
                onClick={saveProduct}
            >
                Save
            </button>
            <button type="button" className="btn btn-secondary btn-lg">
                Cancel
            </button>
        </Fragment>)}

        </section>
    );
};

export default Edit;

if(document.getElementById('app')){
    ReactDOM.render(<Edit/>,document.getElementById('app'));
}

