/** VERSION: 1.0.0 Please do not delete this line. Thank you! **/
// Override Settings
var boostPFSInstantSearchConfig = {
	search: {
		//suggestionMode: 'test',
		//suggestionPosition: 'left'
	}
};

(function() {
	BoostPFS.inject(this);

  // Clear button for the Form Search
  HTMLDocument.prototype.ready = function () {
    return new Promise(function(resolve, reject) {
      if (document.readyState === 'complete') {
        resolve(document);
      } else {
        document.addEventListener('DOMContentLoaded', function() {
          resolve(document);
        });
      }
    });
  }
  
  document.ready().then(function(){
    var inputSearchFormSelector = jQ('.boost-pfs-search-input');
    var clearSearchFormSelector = jQ('.boost-pfs-search-form-btn-clear');

    if(!!inputSearchFormSelector.val()) {
      clearSearchFormSelector.show();
    }
    
    inputSearchFormSelector.on('change keydown keyup', function(){
      if(!!jQ(this).val()) {
        clearSearchFormSelector.show();
      } else {
        clearSearchFormSelector.hide();
      }
    })

    clearSearchFormSelector.on("click", function(){
      inputSearchFormSelector.val("");
      jQ(this).hide();
      inputSearchFormSelector.click();
    });
  })// End Clear button for the Form Search
  

	// Customize style of Suggestion box
	SearchInput.prototype.customizeInstantSearch = function() {
		var suggestionElement = this.$uiMenuElement;
		var searchElement = this.$element;
		var searchBoxId = this.id;
	};

  // Bind Event for input search Mobile
  var bindEventsMobile = InstantSearchMobile.prototype.bindEvents;
  InstantSearchMobile.prototype.bindEvents = function() {
    bindEventsMobile.call(this);

    var self = this;
    var searchButtonMobile = '.site-nav--mobile .search-button, .js-search-destop';
    var searchInputMobile = '.search-input-group input[type="search"], .wg-search-form .search-input';
    var searchCloseButtonMobile = '.drawer__close > button, .drawer_back a';
    jQ(searchButtonMobile).off('click').click(function(e) {
      e.preventDefault();
      //e.stopPropagation();
      jQ(searchInputMobile).focus();
      self.openSuggestionMobile();
      jQ(searchCloseButtonMobile).trigger('click');

    });
  }
  
  // Bind Event for input search style 3
  var bindEvents = InstantSearchStyle3.prototype.bindEvents;
  InstantSearchStyle3.prototype.bindEvents = function() {
    bindEvents.call(this);

    var self = this;
    var searchButtonDesktop = '.site-header__links .search-button';
    var searchInputDesktop = '#SearchContainer #search-input';
    var searchCloseButtonDesktop = '.drawer__close > button';
    jQ(searchButtonDesktop).off('click').click(function(e) {
      e.preventDefault();
      //e.stopPropagation();
      jQ(searchInputDesktop).focus();
      self.openSuggestionStyle3();
      jQ(searchCloseButtonDesktop).trigger('click');

    });
  }

  // Fix search for the Flow theme
  jQ('.site-header__links .search-button').on('click', function() {
    setTimeout(function() {
      boostPFS.initSearchBox();
      if(Utils.isCollectionPage()) jQ('.search-input-group > .boost-pfs-search-box').val('');
    }, 500);
  });

/* Start boost 180299 - Get prices from the first variant */
  InstantSearchResultItemProduct.prototype.compileSuggestionProductPrice = function () {
        // Get First Variant (selected_or_first_available_variant)
        var firstVariant = this.data['variants'][0];
        if (Utils.getParam('variant') !== null && Utils.getParam('variant') != '') {
          var paramVariant = this.data.variants.filter(function(e) {
            return e.id == Utils.getParam('variant');
          });
          if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
        } else {
          for (var i = 0; i < this.data['variants'].length; i++) {
            if (this.data['variants'][i].available) {
              firstVariant = this.data['variants'][i];
              break;
            }
          }
        }
        var price_min = firstVariant.price;
        var compare_at_price_min = firstVariant.compare_at_price;
		// If the multi-currency feature is enabled, update the product price
		this.prepareSuggestionProductPriceData();
		// Check on sale
		var onSale = compare_at_price_min > price_min;
		// Format price
		var price = Utils.formatMoney(price_min);
		var compareAtPrice = '';
		if (this.data && compare_at_price_min) {
			compareAtPrice = Utils.formatMoney(compare_at_price_min);
			if (Settings.getSettingValue('search.removePriceDecimal')) {
				price = Utils.removeDecimal(price);
				compareAtPrice = Utils.removeDecimal(compareAtPrice);
			}
		}
		
		// Build Price
		var result = '';
		if (Settings.getSettingValue('search.showSuggestionProductPrice')) {
			if (onSale && Settings.getSettingValue('search.showSuggestionProductSalePrice')) {
				result = this.getTemplate(InstantSearchResultItemProduct.tempType.PRICE_SALE);
			} else {
				result = this.getTemplate(InstantSearchResultItemProduct.tempType.PRICE);
			}
		}
		return result
			.replace(/{{regularPrice}}/g, price)
			.replace(/{{compareAtPrice}}/g, compareAtPrice);
	}
/* End boost 180299 */
})();