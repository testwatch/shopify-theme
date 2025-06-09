window.removedTravelCase = false;

// =============================================================mini cart============================================================
function promocode(){
  if(!$('#af_cart_slider label').hasClass('title_toggle')) {
    $('#af_cart_slider .af_cd_setup').before('<label class="title title_toggle">Enter Promo Code <span class="plus_minus_discount">+</span></label>');
    $('#af_cart_slider .af_cd_setup').hide();  
    $('#af_discount_response_popup').hide();
  }
}

function dollarify(rawValue) {
  return rawValue.toLocaleString("en-US", {style:"currency", currency:"USD"});
}
  
var progressMsgs = {
  inProgress: `You've earned a <b>3 watch travel case</b> for free, use Code: <b>FREETRAVEL</b>!`,
  completedProgress(value) { 
    return `You are <b class="progress_price">${value}</b> away from getting the 3 watch travel case for free!`
  }
}

function addItem(id, quantity = 1) {

  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id, quantity
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log(data);
    success();
  });
}

function removeItemById (id, quantity = 0) {
  console.log('Removing: ', id, quantity);
  fetch('/cart/change.js', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      id, quantity
    })
  })
   .then(res => res.json())
   .then(data => {
     console.log(data);
     success();
   });
}

function removeTravelCase() {
  const cartDrawer = document.querySelector('.mini_cart');
  const travelCaseRemoveBtn = cartDrawer.querySelector('.remove_item a[data-id="41786342408358"]');
  removeItem('41786342408358');
  window.removedTravelCase = true;
//   travelCaseRemoveBtn.click();
}

function renderProgressBar(price) {
  var progressBarWidget = document.querySelector('#progress-bar-widget');
  if (!progressBarWidget) return;
  
  var progressBar = progressBarWidget.querySelector('#progress-bar');
  var progress = progressBarWidget.querySelector('#progress-bar .progress');
  
  var progressInfo = progressBarWidget.querySelector('.progress_info');
  var threshold = +progressBarWidget.dataset.threshold;
  
  var progressPercent = (price * 100 / threshold);
  
  if (!progressPercent){
    progressBarWidget.classList.remove('display-block');
  } else {
    progressBarWidget.classList.add('display-block'); 
  }
  
  progressPercent = progressPercent > 100 ? 100 : progressPercent;
  
  progress.style.width = `${progressPercent}%`;
  if (price >= threshold) {
    progressInfo.innerHTML = progressMsgs.inProgress;
  } else {
    progressInfo.innerHTML = progressMsgs.completedProgress(dollarify((threshold - price) / 100));
  }
}


$(document).on('click', '.remove_item a[data-id="41786342408358"]', function(e){
  e.preventDefault();
  setTimeout(function(){
      const cartDrawer = document.querySelector('.mini_cart');
    const travelCaseRemoveBtn = cartDrawer.querySelector('.remove_item a[data-id="41786342408358"]');
    window.removedTravelCase = true;
    removeItem('41786342408358');
  },3500);
});


function renderProgress({ items, total_price: price }) {
  const travelCaseId = 41786342408358;
  
  const travelCaseIsInCart = items.find(item => item.id == travelCaseId);
 
  if ( price >= 35000 && !travelCaseIsInCart ){ 
    if (! removedTravelCase){
     console.log('Adding Travel Case!!');
     addItem(travelCaseId);
    }
     
  } else if ( travelCaseIsInCart && price < 47500 ){
     removeTravelCase();
     return;
  }
  console.log('NOthing TO Do');
  renderProgressBar(price);
  
}


window.addEventListener('load', (event) => {
  promocode();
});

function openDrawer() {
  $('body').addClass('cart-drawer-open');
  $('.cart-drawer-open button.fixed_button').hide();
  $('.mini_cart').css('transform','translate(0px)');
  $('.cart_overlay').show();
}

function closeDrawer() {
  $('.mini_cart').css('transform','translate(460px)');
  $('body').removeClass('cart-drawer-open');
  $('button.fixed_button').show();
}

$(document).ready(function(){
  $('.cart-item').click(function(){
    promocode();
    openDrawer();
  });

  $(document).on('click', '.close-cart-img', function(){
    closeDrawer();
  });

  $('.cart_overlay').click(function(){
    closeDrawer();
  });
 
  $(document).on('click', '.cart_inner_loop .js-change-quantity span', function(e){
    var $this = $(this);
    var $qtyDom = $this.closest('.js-change-quantity').siblings('input');
    var min = parseInt($qtyDom.attr('min'));
    var adj = $this.hasClass('qty-minus') ? -1 : 1;
    var qty = parseInt($qtyDom.val()) + adj;

    if($this.hasClass('qty-minus')) {
      if(qty == 0) return !0;
      $qtyDom.val(Math.max(min, qty)).trigger('change');
    } else {
      $qtyDom.val(qty).trigger('change');
    }
  });

  $(document).on('change', '.cart_inner_loop .quant_div input', function(e){
    var qty = parseInt($(this).val());
    var id = $(this).data('id');
    
    var updateData = {};
    updateData[id] = qty;
    
    updateQty(updateData);

  });
});

function updateQty (updateData, cartForm) {
  $.ajax({
    url: '/cart/update.js',
    dataType: 'json',
    cache: false,
    type: 'post',
    data: {updates: updateData},
    success: function (data) {
      document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': data}));

      var price = data.total_price;
      renderProgress(data);
      
    }
  });
}

function success(){
  $.ajax({
    url: "/cart",
    type: 'GET',
    dataType: 'html',
    success: function(response) {
      $('.mini_cart').html('');
      var result = $(response).find('.cart_data');
      $('.mini_cart').html(result);
      $('.mini_cart').show();
      $('.cart-overlays').show();
      Shopify.shippingMessageApp.render();
      
      // Extend - Dispatch event to initialize cart offers after mini-cart has been built	
      window.dispatchEvent(new CustomEvent('initCartOffers'));
    }
  });
  
  if(!$('#af_cart_slider label').hasClass('title_toggle')){
    promocode();
  }
}

function reloadMiniCart() {
  jQuery.getJSON('/cart.js', function(cart) {
    var cart_total_item = cart.item_count;
    $('.cart-count').html(cart_total_item);
     var price = cart.total_price;
          renderProgress(cart);
  } );
  
  success();
 
  $('.mini_cart').removeClass('extras');
  $('body').addClass('cart-drawer-open');
   $('.cart-drawer-open button.fixed_button').hide();
  $('.cart-overlays').show();
  $('.mini_cart').css('transform','translate(0px)');
}

$(document).ready(function(){
  var freeSelectedItemsIDs = [];

  $('.cart-page-link').click(function(e){
    e.preventDefault();
    $('.mini_cart').removeClass('extras');
    $('.cart-overlays').show();
  })

  $(document).on('click', '#AddToCart', function(e){
    e.preventDefault();
	
    var formItems = { 'items': [] };
    var old_this = $(this);
    $(old_this).val('Added');
	
    var var_id = $('.product-single__variants option:selected').val();
    var varaint_qt = 1;
    // var varaint_qt = $('.cart__quantity-selector').attr('value');

    if(freeSelectedItemsIDs.length) {
      formItems.items = freeSelectedItemsIDs.reduce(function(data, item) {
        data.push({ id: item, quantity: 1 })
        return data
      },[]);
    }

    formItems.items.push({ id: var_id, quantity: varaint_qt });

    $.ajax({
      type: "POST",
      url: "/cart/add.js",
      data: formItems,
      dataType: "json",
      success: function (data) {
         reloadMiniCart()
        
        jQuery.getJSON('/cart.js', function(cart) {

          document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': cart}));
          promocode();
          openDrawer();
          
          
          if(cart.item_count == 1) {
            // Load upsell slider
            setTimeout(function(){  $('div.mini_cs_slider').css("opacity","1"); }, 3000);
            var mini_cs_slider = $('.mini_cs_slider__inner');
            mini_cs_slider.slick({
              dots: true,
              slidesToShow: 2,
              slidesToScroll: 2,
              arrows: true,
              prevArrow:"<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
              nextArrow:"<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            });
          }
          
          console.log('GOne', cart);
          
           var price = cart.total_price;
          
          renderProgress(cart);
        });
      }
    });
  });

  $(".gfqv-swatch-value").click(function () {
     var variantid = $(this).find('.gfqv-swatch-image').attr('data-variant-id'); 
     $('#gfqv-btn-wrap a').attr('data-var-id',variantid);
 });



  $(document).on('click', '#gfqv-btn', function(e){
    e.preventDefault();
    setTimeout(function(){
    var formItems = { 'items': [] };
    var old_this = $(this);
    $(old_this).val('Added');
	 var var_id = $('#gfqv-btn').attr('data-var-id');
//     var var_id = $('.product-single__variants option:selected').val();
    var varaint_qt = 1;
    // var varaint_qt = $('.cart__quantity-selector').attr('value');

    if(freeSelectedItemsIDs.length) {
      formItems.items = freeSelectedItemsIDs.reduce(function(data, item) {
        data.push({ id: item, quantity: 1 })
        return data
      },[]);
    }

    formItems.items.push({ id: var_id, quantity: varaint_qt });

    $.ajax({
      type: "POST",
      url: "/cart/add.js",
      data: formItems,
      dataType: "json",
      success: function (data) {
        reloadMiniCart();
        
        jQuery.getJSON('/cart.js', function(cart) {

          document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': cart}));
          promocode();
          openDrawer();
          
          $('.mini_cart').css('z-index','999');
          $('.gfqv-modal').css('z-index','1');
          if(cart.item_count == 1) {
            // Load upsell slider
            setTimeout(function(){  $('div.mini_cs_slider').css("opacity","1"); }, 3000);
            var mini_cs_slider = $('.mini_cs_slider__inner');
            mini_cs_slider.slick({
              dots: true,
              slidesToShow: 2,
              slidesToScroll: 2,
              arrows: true,
              prevArrow:"<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
              nextArrow:"<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            });
          }
          
          console.log('GOne', cart);
          
           var price = cart.total_price;
          
          renderProgress(cart);
        });
      }
    });},2000)
  });

  $('.free-space_new .product-details.product_cards input').change(function(e){
		e.preventDefault();
		e.stopPropagation();

		var total_price;
		var pro_item_price = $('#AddToCart').attr('data-price') * 100;
	
    var freeItemsPrice = 0;
    var freeSelectedItems = [];

    var $freeItems = $('.free-space_new .extra_product_outer_list');

    $freeItems.each(function() {
      var _this = $(this);
      _this.find('.extra_product_inner_list .item').each(function(){
        if($(this).find('input').is(':checked')) {
          freeSelectedItems.push($(this));
          // freeItemsPrices.push($(this).find('.original_price').data('price') * 100);
        }
      });
    });

    freeSelectedItemsIDs = [];
    if(freeSelectedItems.length > 0) {
      freeItemsPrice = freeSelectedItems.map(r => r.find('.original_price').data('price') * 100).reduce((a, b) => a + b, 0);
      freeSelectedItemsIDs = freeSelectedItems.map(r => r.find('input').data('variant-id'));
    }
    
    total_price = pro_item_price + freeItemsPrice;
    
    $('#AddToCart').children('.money').html($(Shopify.formatMoney(total_price, moneyFormat)).text());
	});


  $(document).on("click",".miniremove_item",function(e) {
    e.preventDefault();
    removeItem(parseInt($(this).attr('data-id')));
  });


  $(document).on('click', '.cart_addition', function(){
        
    var checkValues = $(this).attr('data-id');
    $.ajax({
      type: "post",
      url: '/cart/add.js',
      data: {
        id: checkValues,
        quantity: 1
      },
      success: function (data) {
        // success();
        jQuery.getJSON('/cart.js', function(cart) {
          document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': cart}));
          promocode();
          openDrawer();

          if(cart.item_count == 1) {
            // Load upsell slider
            setTimeout(function(){  $('div.mini_cs_slider').css("opacity","1"); }, 3000);
            var mini_cs_slider = $('.mini_cs_slider__inner');
            mini_cs_slider.slick({
              dots: true,
              slidesToShow: 2,
              slidesToScroll: 2,
              arrows: true,
              prevArrow:"<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
              nextArrow:"<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            });
          }
           var price = cart.total_price;
          renderProgress(cart);
        });
      }
    });
  })
  
  $(document).on('click', 'a.plan_btn', function(){
    var checkValues = $(this).attr('data-var-id');
    $.ajax({
      type: "post",
      url: '/cart/add.js',
      data: {
        id: checkValues,
        quantity: 1
      },
      success: function (data) {
        // success();
        jQuery.getJSON('/cart.js', function(cart) {
          document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': cart}));
          promocode();
          openDrawer();

          if(cart.item_count == 1) {
            // Load upsell slider
            setTimeout(function(){  $('div.mini_cs_slider').css("opacity","1"); }, 3000);
            var mini_cs_slider = $('.mini_cs_slider__inner');
            mini_cs_slider.slick({
              dots: true,
              slidesToShow: 2,
              slidesToScroll: 2,
              arrows: true,
              prevArrow:"<button type='button' class='slick-prev pull-left'><i class='fa fa-angle-left' aria-hidden='true'></i></button>",
              nextArrow:"<button type='button' class='slick-next pull-right'><i class='fa fa-angle-right' aria-hidden='true'></i></button>"
            });
          }
           var price = cart.total_price;
          renderProgress(cart);
        });
      }
    });
     
  })
  
  $(document).on('click', '.title_toggle', function(){
    if ($('.af_cd_setup').is(':visible')) {
      $(".af_cd_setup").slideUp(300);
      $(".plus_minus_discount").text('+');
    }
    if ($(this).next(".af_cd_setup").is(':visible')) {
      $(this).next(".af_cd_setup").slideUp(300);
      $(this).children(".plus_minus_discount").text('+');
    } else {
      $(this).next(".af_cd_setup").slideDown(300);
      $(this).children(".plus_minus_discount").text('-');
    }
  });

});

// attach this function to the event handler
function removeItem(productId) {
  // ajax post to update cart
  $.ajax({
    type: "POST",
    url: "/cart/change.js",
    dataType: "json",
    data: 'quantity=0&id=' + productId
  }).done(function(data, textStatus, jqXHR) {
    console.log("After removing item...", data);
    if(data.item_count > 0) {
//       document.dispatchEvent(new CustomEvent('cartDrawer:reload', {'detail': data}));
        reloadMiniCart();
    }
    else {
      // Empty the mini cart
      $('.mini-cart-inner').addClass('is-hidden');
      $('.empty-mini-wrapper').addClass('is-visible');
      $('.cart_drawer_outer form.cart_inner_loop').html('');
      $('.cart_drawer_outer .bottom_buttons .total_price').html(''); 
    }
    
    var price = data.total_price;
    renderProgress(data);

    // var cart_total_item = data.item_count;
    // $('.cart-count').html(cart_total_item);
    // min_cart();
  });
}
// mini cart function here  
function min_cart(){
  $.ajax({
    url: '/cart',
    success: function(data) {
      $('.mini_cart').html('');
      var cart1 = $(data).find('.mini_cart .cart_data');
      console.log("min_cart()...", data);
      $('.mini_cart').html(cart1);
      var cart_total_item = data.item_count;
      $('.cart-count').html(cart_total_item);

      // EXTEND -- Dispatch event to initialize cart offers	
      window.dispatchEvent(new CustomEvent('initCartOffers'))	
      // EXTEND -- End Extend code
    }
  });
}

function getItemHTML(items, detailedProducts) {
  var _HTML = ''

  for (let i=0; i < items.length; i++) {
    let item = items[i];
    var _product = detailedProducts[i];
    var inner_info = '';
    
    _HTML += '<div class="cart__row cart_loop"><div class="grid--full cart__row--table-large"><div class="grid__item post-large--one-whole"><div class="grid">';

    // item image
    if(item.image != '') {
      _HTML += ['<div class="grid__item one-quarter fulll_widt">','<a href="'+ item.url +'">','<div id="ProductImageWrapper-'+ item.id +'" class="cart__image-wrapper supports-js">','<img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="'+ item.image +'" alt="'+ item.title +'">','</div></a></div>'].join('');
    } else {
      _HTML += ['<div class="grid__item one-quarter fulll_widt">','<a href="'+ item.url +'">','<div id="ProductImageWrapper-'+ item.id +'" class="cart__image-wrapper supports-js">','<img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" data-src="'+ item.featured_image.url +'" alt="'+ item.title +'">','</div></a></div>'].join('');
    }     

    // item contents
    _HTML += '<div class="grid__item three-quarters fulll_widths">';
    _HTML += '  <div class="grid__item one_whole main_info_box">';
    _HTML += '    <div class="left_side_info">';
    _HTML += '      <a href="'+ item.url +'" class="h5 cart__product-title">'+ item.product_title +'</a>';

    if(item.variant_title != null && item.variant_title.indexOf('Default') > -1) _HTML += '<small class="cart_var_title">'+ item.variant_title +'</small>';

    // if(item.properties) {
    //   $.each(item.properties, function(title, value) {
    //   });
    // }

    _HTML += '<div class="same_color price_div">';
    
    if(item.original_price == item.final_price) {
      _HTML += '<span class="h5">';

      // productHasSale
      if(_product.compare_at_price != null && _product.compare_at_price > _product.price) {
        // Total savings
        saved_amount = (_product.compare_at_price - _product.price) * 100 / _product.compare_at_price;
        saved_amounts = _product.compare_at_price - _product.price;

        inner_info = '<div class="pricing_with_sale"><span class="compare_price">'+ Shopify.formatMoney(_product.compare_at_price, moneyFormat) +'</span><p class="save_price">You save &nbsp; '+ Shopify.formatMoney(saved_amounts, moneyFormat) +' </p><div class="sale_pricing">'+ Shopify.formatMoney(_product.price, moneyFormat) +'<span class="save_percentage">('+ Math.floor(saved_amount) +'% off)</span></div></div>';
        _HTML += inner_info;

      } else {
        _HTML += Shopify.formatMoney(_product.price, moneyFormat);
      }

      _HTML += '</span>';
      
    } else {
      _HTML += '<span class="visually-hidden">Regular price</span><del class="h5">'+ Shopify.formatMoney(item.original_price, moneyFormat) +'</del><span class="visually-hidden">Sale price</span><span class="order-discount h5">'+ Shopify.formatMoney(item.final_price, moneyFormat) +'</span>';
    }

    // discount
    var { line_level_discount_allocations } = item;
    var itemDiscountHtml = "";

    if(line_level_discount_allocations.length) {
      _HTML += '<ul class="order-discount order-discount--list order-discount--title order-discount--cart medium-down--hide" aria-label="Discount">';

      for (i=0; i < line_level_discount_allocations.length; i++) {
        itemDiscountHtml = '<li class="order-discount__item"><span class="icon icon-saletag" aria-hidden="true"></span>'+ line_level_discount_allocations[i].title +' (-'+ Shopify.formatMoney(line_level_discount_allocations[i].amount, moneyFormat) +')</li>';
      }

      _HTML += itemDiscountHtml;
      _HTML += '</ul>';
    }

    _HTML += '</div>';
    // same_color price_div END

    _HTML += ['<div class="common_div">','<div class="same_color edit_div">','<a href="'+ item.url +'"> <span class="edit_products"><i class="fa fa-pencil" aria-hidden="true"></i></span></a>','<div class="remove_item">','<a href="#" class="miniremove_item" data-id="'+ item.variant_id +'" title="Remove Item"><small>Remove</small></a>','</div>','</div>','<div class="Add_plan '+ $('body .cart_middle_info').data('add_plan_title') +'" style="display:none;">','<a href="#" data-var-id ="'+ $('body .cart_middle_info').data('add_plan_id') +'" class="plan_btn">Add a protection plan for $45</a>','</div>','</div>'].join('');

    _HTML += '</div>';
    // left_side_info END

    _HTML += ['<div class="same_color quant_div right_side_info">','<div class="js-change-quantity qty-down">','<span class="qty-minus"></span>','</div>','<input type="number" class="cart__quantity-selector" value="'+ item.quantity +'" data-id="'+ item.id +'" data-variant-id="'+ item.variant_id +'" data-product-id="'+ item.product_id +'" min="1" aria-label="Quantity">','<div class="js-change-quantity qty-up">','<span class="qty-plus"></span>','</div>','</div>'].join('');

    _HTML += '</div>';
    // grid__item one_whole main_info_box END

    _HTML += ['<div id="extend-ajax-cart-offer"	data-extend-variant="'+ item.variant_id +'" data-extend-quantity="'+ item.quantity +'">','</div>'].join('');

    _HTML += '</div>';
    // grid__item three-quarters fulll_widths END

    _HTML += '</div></div></div></div>';
  }

  return _HTML;
}

function getProductByHandle(handle) {
  return new Promise((resolve, reject) => {
    jQuery.ajax({
      dataType: "json",
      async: false,
      cache: false,
      url: "/products/" + handle + ".js",
      success: resolve,
      error: reject
    });
  })
}

document.addEventListener("cartDrawer:reload", function(event) {
  var { items, total_price, item_count } = event.detail;
  var detailedProducts = [];

  if(item_count > 0) {
    $('.mini-cart-inner').removeClass('is-hidden');
    $('.empty-mini-wrapper').removeClass('is-visible');
  }

  for (i = 0; i < items.length; i++) {
    getProductByHandle(items[i].handle)
    .then((productDetails) => {
      detailedProducts.push(productDetails);

      if(detailedProducts.length == items.length) {
        var drawerCart = getItemHTML(items, detailedProducts);
        $('.cart_drawer_outer form.cart_inner_loop').html(drawerCart);
        $('.cart_drawer_outer .bottom_buttons .total_price').html(Shopify.formatMoney(total_price, moneyFormat));
        $('.mini_cart .item_subtotal .Cart_Sec').html('CheckOut ' + Shopify.formatMoney(total_price, moneyFormat));

        window.dispatchEvent(new CustomEvent('initCartOffers'));
      }
    })
    .catch(err => {
      console.log(err)
    })
  }

});