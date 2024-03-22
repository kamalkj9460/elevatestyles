function getExtrasProductDataByAjax(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, allAjaxData) {
  if (!ajaxPage) ajaxPage = 0;
  if (!allAjaxData) allAjaxData = [];

  // We can only get 20 products per ajax call, if there are more than 20 products per page, we need to call multiple times
  if (!numberProductPerAjaxCall || numberProductPerAjaxCall > 20){
    numberProductPerAjaxCall = 20;
  }
  var fromIndex = numberProductPerAjaxCall * ajaxPage;
  var toIndex = Math.min(data.length, numberProductPerAjaxCall * (ajaxPage + 1));
  var handles = [];
  for (var i = fromIndex; i < toIndex; i++) {
    handles.push(data[i].handle);
  }
  var handleString = handles.join("+");
  var path = Utils.buildProductItemUrl({handle:'test'});
  if (path.includes('/collections/')) {
    path = path.split('/collections/')[0];
  } else {
    path = path.split('/products/')[0];
  }

  path += '/collections/all';

  var itemDataUrl = path + "/" + handleString + "?view=" + templateName;
  return new Promise((resolve, reject) => {
    jQ.ajax({
      type: "GET",
      url: itemDataUrl,
      success: function(ajaxData) {
        // the same call as buildExtrasProductListByAjax, with one extra params: ajaxData (the new data we just got from ajax call)
        onGetExtrasProductDataByAjaxSuccess(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, ajaxData, allAjaxData);
        resolve(ajaxData);
      }.bind(this),
      error: function (error) {
        reject(error)
      },
    });
  })
}

function onGetExtrasProductDataByAjaxSuccess(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, ajaxData, allAjaxData) {
  // Try to parse the json we get from collection endpoint
  try {
    if(/<\!--.*?-->/.test(ajaxData)){
      ajaxData = ajaxData.replace(/<\!--.*?-->/g, '');
    }
    // Add the new data to the "all data" list
    allAjaxData = allAjaxData.concat(JSON.parse(ajaxData).products);
  } catch (error) {
    console.error('Could not parse json from ' + templateName + ": " + error.message);
  }

  // We can only get 20 products per ajax call, if there are more than 20 products per page, we need to call multiple times
  var fromIndex = numberProductPerAjaxCall * ajaxPage;
  if (fromIndex < data.length - 1) {
    ajaxPage++;
    getExtrasProductDataByAjax(data, templateName, callback, numberProductPerAjaxCall, ajaxPage, allAjaxData);
  } else {
    // After getting all products from all pages, call the callback function
    if (typeof callback == 'function') {
      callback(allAjaxData);
    }
  }
}

  if (typeof FilterApi !== 'undefined') {
    FilterApi.afterCallAsync = function(result, callbackFilterApi) {      
      var currency = boostPFSConfig.general.current_currency.toLowerCase();
      if (result.products.length === 0) { 
        callbackFilterApi(result);
        return;
      }

      getExtrasProductDataByAjax(result.products, "boost-fix-prices", function(productsData) {
      }).then((data) => {
        var productData = JSON.parse(data);

        productData.products.forEach(function(product) {
          var idx = result.products.findIndex(function(apiProduct) { return apiProduct.id === product.id });
          if (idx >= 0) {
            result.products[idx].compare_at_price_min = product.compare_at_price_min / 100;
            result.products[idx].price_min = product.price_min / 100;
            result.products[idx].price_max = product.price_max / 100;

            result.products[idx]['compare_at_price_min_' + currency] = product.compare_at_price_min / 100;
            result.products[idx]['price_min_' + currency] = product.price_min / 100;
            result.products[idx]['price_max_' + currency] = product.price_max / 100;
            
            // Update variant price
            result.products[idx]['variants'].forEach(function(variant) {
              var variantId = variant.id;
              var priceIndex = variantId + '_price';
              var compareAtPriceIndex = variantId + '_compare_at_price';
              
              variant.price = product[priceIndex] / 100;
              variant.compare_at_price = product[compareAtPriceIndex] / 100;
            });
          } 
        })
        
        callbackFilterApi(result);
      })
      .catch((error) => {
        console.log(error)
      });
    }
  }

InstantSearchApi.afterCallAsync = function(result, callbackInstantSearchApi) {
  var currency = boostPFSConfig.general.current_currency.toLowerCase();
  
  if (result.products.length === 0) { /* currency check */
    callbackInstantSearchApi(result);
    return;
  }

  getExtrasProductDataByAjax(result.products, "boost-fix-prices", function(productsData) {
  }).then((data) => {
    var productData = JSON.parse(data);

    productData.products.forEach(function(product) {
      var idx = result.products.findIndex(function(apiProduct) { return apiProduct.id === product.id });
      if (idx >= 0) {
        result.products[idx].compare_at_price_min = product.compare_at_price_min / 100;
        result.products[idx].price_min = product.price_min / 100;
        result.products[idx].price_max = product.price_max / 100;

        result.products[idx]['compare_at_price_min_' + currency] = product.compare_at_price_min / 100;
        result.products[idx]['price_min_' + currency] = product.price_min / 100;
        result.products[idx]['price_max_' + currency] = product.price_max / 100;

        // Update variant price
        result.products[idx]['variants'].forEach(function(variant) {
          var variantId = variant.id;
          var priceIndex = variantId + '_price';
          var compareAtPriceIndex = variantId + '_compare_at_price';

          variant.price = product[priceIndex] / 100;
          variant.compare_at_price = product[compareAtPriceIndex] / 100;
        });
      } 
    })

    callbackInstantSearchApi(result);
  })
  .catch((error) => {
    console.log(error)
  });
}

Utils.isEnableShopifyMultipleCurrencies = function() {
  return false;
}