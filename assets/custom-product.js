function splititPdpVariant() {
	var variantId = ShopifyAnalytics && ShopifyAnalytics.meta.selectedVariantId;
	var productVariants = getVariants();
	var productVariant = productVariants.find(function (variant) {
		return variant.id == variantId;
	})

	if (!productVariant) return;

	var variantPrice = productVariant.price;
	var priceMoney = variantPrice / 100;
	// Set the data attribute with new value
	$("#splitit-container").attr('data-splitit-amount', priceMoney);
	// Render placement with new information
	splitit.ui.refresh();
}

function getVariants() { return ShopifyAnalytics && ShopifyAnalytics.meta.product.variants; }

function splititInit() {
	var productUrl = document.URL;
	document.addEventListener('change', function () {
		var currentUrl = document.URL;
		var url = new URL(currentUrl);
		var isVariantUrl = url.searchParams.get("variant");
		currentUrl = isVariantUrl ? currentUrl : isVariantUrl;
		if (currentUrl && productUrl != currentUrl) {
			productUrl = currentUrl;
			splititPdpVariant();
		}
	});
}
splititInit();

// Start $(document).ready
$(document).ready(function(){
	$(".desktop_review").on('click',function() {
		$('html, body').animate({
			scrollTop: $("ul#tab-wrapper").offset().top-200
		}, 2000);

		$('ul#tab-wrapper li.desktop_review_tab a').trigger('click');
	});

	$(".mobile-review").on('click',function() {
		$('html, body').animate({
			scrollTop: $(".reviews_accordion").offset().top
		}, 2000);

		// if ($('.reviews_body').is(':visible')) {
		// 	$('.reviews_body').css('display','block');
		// 	$('.reviews_accordion').next(".accordion_body").children(".plusminus").text('-');
		// } else {
		// 	$('.reviews_accordion').trigger('click');
		// }

	});

	// Removed Video from Product Pages on Mobile
	if ($(window).width() <= 768) {
		$('.gallery-video').remove();
	}

	$('.swatch-element').click(function(){
    var variant_price = $(this).data('price');   
    $('.price_part .price_update').html(variant_price);
  });
	
	// variant upsells in product-template section
	$('form .swatch-element.color input').change(function(){
		var price_block = $(this).closest('.swatch-element').data('price');
		$('#AddToCart').attr('data-price',$(price_block).text().replace('$', ''));
		$('#AddToCart').children('.money').html($(price_block).text());
	});

	$('.swatch-element').on('click', 'label', function(){
		var image = $(this).attr('data-image');
		$('.feature_image').attr('src',image);
 	});

	$('.addtocart_btn, .product_button').click(function(){
		$('#AddToCart').trigger('click');
	});
  setTimeout(function(){document.querySelector('.swatch-element.swatch-one label').click();},0);	
});

// End $(document).ready

// Start window loaded event
window.addEventListener('load', (event) => {
	$('.free-space_new li span').each(function () {
		//console.log(variant.id);
		if (typeof variant != 'undefined' && $(this).hasClass(variant.id)) {
		$('.free-space_new li span').removeClass('disabled_title');
		$(this).addClass('active_title');
		} else {
			$('.free-space_new li span').addClass('disabled_title');
			$(this).removeClass('active_title');
		}
	});

	$('.product-single__thumbnails').on('click', 'a', function(e){
		e.preventDefault();
		e.stopPropagation();

		var src= $(this).children('img').attr('data-src');
		$('#ProductPhoto img').attr('src',src);
		$('#ProductPhoto img').attr('srcset',src);
		$(".zoom-cls").attr('src',src);
		$('.zoomWindowContainer div').stop().css("background-image","url("+ src +")");


		// initializing video
		$('#ProductPhoto .video_cls').remove();
	});

		// Initialize theme's JS on docready
	$(".zoom-cls").elevateZoom({
		zoomWindowFadeIn: 500,
		zoomWindowFadeOut: 500,
		lensFadeIn: 500,
		lensFadeOut: 500,
		zoomWindowHeight:700,
		zoomWindowWidth:700
	});

	$(document).on('click','.product-single .cc-video' , function() {
		var html = $(this).attr('data-scr');
		$('#ProductPhoto').append('<div class="video_cls video_wrap">'+ html +'</div>');
	});
});
// End window loaded event


// =============== Alexender Product Onload Page Remove Click Script Start ====================== 
window.onload = function(){
$('body').removeClass('product_name_product-alexander-watches')
};
// =============== Alexender Product Onload Page Remove Click Script End ======================
function updateMainProductImage(variant) {
  if (!variant || !variant.featured_image) return;

  const mainImg = document.querySelector('#MainProductImage');

  if (mainImg) {
    mainImg.setAttribute('src', variant.featured_image.src);
    mainImg.setAttribute('data-src', variant.featured_image.src); // for themes that still use lazyload
  }
}

document.addEventListener('change', function () {
  const variantId = document.querySelector('[name="id"]')?.value;

  if (!variantId || !ShopifyAnalytics?.meta?.product?.variants) return;

  const variant = ShopifyAnalytics.meta.product.variants.find(v => v.id == variantId);
  updateMainProductImage(variant);
});
