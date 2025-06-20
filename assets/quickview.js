$(document).ready(function () {
    $.getScript("//cdnjs.cloudflare.com/ajax/libs/fancybox/2.1.5/jquery.fancybox.min.js").done(function() {
        quickView();
    });
});

function quickView() {
    $(".quick-view").click(function (event) {
      event.preventDefault();
        if ($('#quick-view').length == 0) {
            $("body").append('<div id="quick-view"></div>');
        }

        var product_handle = $(this).data('handle');
        $('#quick-view').addClass(product_handle);

        jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
            var title = product.title;
            var type = product.type;
            var price = 0;
            var original_price = 0;
            var desc = product.description;
            var images = product.images;
            var variants = product.variants;
            var options = product.options;
            var url = '/products/' + product_handle;
            $('.qv-product-title').text(title);
            $('.qv-product-type').text(type);
            $('.qv-product-description').html(desc);
            $('.view-product').attr('href', url);

            var imageCount = $(images).length;
          //console.log("All Images :", images);
            $(product.media).each(function (i, image) {
                if (i == imageCount - 1) {
                    var image_embed = '<div id="' + image.id + '"><img src="' + image.src + '" alt="' + image.alt + '"></div>';
                    image_embed = image_embed.replace('.jpg', '_800x.jpg').replace('.png', '_800x.png');
                    $('.qv-product-images').append(image_embed);

                    $('.qv-product-images').slick({
                        'dots': false,
                        'arrows': false,
                        'respondTo': 'min',
                        'useTransform': false
                    }).css('opacity', '1');

                } else {
                    image_embed = '<div id="' + image.id + '"><img src="' + image.src + '" alt="' + image.alt + '"></div>';
                    image_embed = image_embed.replace('.jpg', '_800x.jpg').replace('.png', '_800x.png');
                    $('.qv-product-images').append(image_embed);
                }
            });


           
            $(options).each(function (i, option) {
                var opt = option.name;
                var selectClass = '.option.' + opt.toLowerCase();
                $('.qv-product-options').append('<div class="option-selection-' + opt.toLowerCase() + '"><span class="option">' + opt + '</span><select class="option-' + i + ' option ' + opt.toLowerCase() + '"></select></div>');
                $(option.values).each(function (i, value) {
                    $('.option.' + opt.toLowerCase()).append('<option value="' + value + '">' + value + '</option>');
                });
            });

            $(variants).each(function (i, v) {
                if (v.inventory_quantity == 0) {
                    $('.qv-add-button').prop('disabled', true).val('Sold Out');
                    $('.qv-add-to-cart').hide();
                    $('.qv-product-price').text('Sold Out').show();
                    return true;
                } else {
                    price = parseFloat(v.price / 100).toFixed(2);
                    original_price = parseFloat(v.compare_at_price / 100).toFixed(2);
                    $('.qv-product-price').text('$' + price);
                    if (original_price > 0) {
                        $('.qv-product-original-price').text('$' + original_price).show();
                    } else {
                        $('.qv-product-original-price').hide();
                    }
                    $('select.option-0').val(v.option1);
                    $('select.option-1').val(v.option2);
                    $('select.option-2').val(v.option3);
                    return false;
                }
            });
        });

        // Update images when the variant selection changes
        $(document).on("change", "#quick-view select", function () {
            var selectedOptions = getSelectedOptions();
            //console.log("selectedOptions :",selectedOptions)
            updateImages(selectedOptions);
        });



        $.fancybox({
            href: '#quick-view',
            maxWidth: 1040,
            maxHeight: 600,
            fitToView: true,
            width: '75%',
            height: '70%',
            autoSize: false,
            closeClick: false,
            openEffect: 'none',
            closeEffect: 'none',
            'beforeLoad': function () {
                var product_handle = $('#quick-view').attr('class');
                $(document).on("click", ".qv-add-button", function () {
                    var qty = $('.qv-quantity').val();
                    var selectedOptions = getSelectedOptions();
                    var var_id = '';
                    jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
                        $(product.variants).each(function (i, v) {
                            if (v.title == selectedOptions) {
                                var_id = v.id;
                                processCart();
                            }
                        });
                    });

                    function processCart() {
                        jQuery.post('/cart/add.js', {
                                quantity: qty,
                                id: var_id
                            },
                            null,
                            "json"
                        ).done(function () {
                            $('.qv-add-to-cart-response').addClass('success').html('<span>' + $('.qv-product-title').text() + ' has been added to your cart. <a href="/cart">Click here to view your cart.</a>');
                            reloadMiniCart();
                        }).fail(function ($xhr) {
                            var data = $xhr.responseJSON;
                            $('.qv-add-to-cart-response').addClass('error').html('<span><b>ERROR: </b>' + data.description);
                        });
                    }
                    function reloadMiniCart() {
                      jQuery.getJSON('/cart.js', function(cart) {
                        var cart_total_item = cart.item_count;
                        $('.cart-count').html(cart_total_item);
                         var price = cart.total_price;
                              // renderProgress(cart);
                      } );
                    
                      
                      success();
                     
                      $('.mini_cart').removeClass('extras');
                      $('body').addClass('cart-drawer-open');
                       $('.cart-drawer-open button.fixed_button').hide();
                      $('.cart-overlays').show();
                      $('.mini_cart').css('transform','translate(0px)');

                      $.fancybox.close();
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
                             $('.cart-orange-on-item').addClass('cart-has-item-css');
                        }
                      });
                      
                      if(!$('#af_cart_slider label').hasClass('title_toggle')){
                        promocode();
                      }
                    }
                });
                $('.fancybox-wrap').css('overflow', 'hidden !important');
            },
            'afterShow': function () {
                var selectedOptions = getSelectedOptions();
                updateImages(selectedOptions);
                $('#quick-view').hide().html(content).css('opacity', '1').fadeIn(function () {
                    $('.qv-product-images').addClass('loaded');
                });
            },
            'afterClose': function () {
                $('#quick-view').removeClass().empty();
            }
        });
    });
}

function getSelectedOptions() {
    var selectedOptions = '';
    $('#quick-view select').each(function (i) {
        if (selectedOptions == '') {
            selectedOptions = $(this).val();
        } else {
            selectedOptions = selectedOptions + ' / ' + $(this).val();
        }
    });
    return selectedOptions;
}

function updateImages(selectedOptions) {
    var product_handle = $('#quick-view').attr('class');
    jQuery.getJSON('/products/' + product_handle + '.js', function (product) {
        //console.log("Product Selected :", product);
        //console.log("selectedOptions :", selectedOptions);
        $(product.variants).each(function (i, v) {
            if (v.title == selectedOptions) {
                //console.log("Title :", v.title);
                //console.log("Varient :", v.featured_media.id);
                var slider = $('.qv-product-images');
                var slideIndex = slider.find('#' + v.featured_media.id).data('slick-index');
                //console.log("Data Index :", slideIndex);
                //updateImagesDisplay(v.images);
                slider.slick('slickGoTo', slideIndex);
            }
        });
    });
}
/*
function updateImagesDisplay(images) {
    console.log('Images:', images); // Add this line to log the images variable

    var slider = $('.qv-product-images');
    var thumbnailsContainer = $('#ProductThumbs');

    // Clear existing slides and thumbnails
    slider.empty();
    thumbnailsContainer.empty();

    // Add new slides and thumbnails
    if (images && images.length > 0) {
        $(images).each(function (i, image) {
            var image_embed = '<div><img src="' + image.src + '" alt="' + image.alt + '"></div>';
            slider.append(image_embed);

            var thumbnail_embed = '<li data-color="' + image.alt + '" class="grid__item wide--one-quarter large--one-third medium-down--one-third"><img class="lazyload1" src="' + image.src + '" alt="' + image.alt + '"></li>';
            thumbnailsContainer.append(thumbnail_embed);
        });

        // Slick slider initialization
        slider.slick({
            dots: false,
            arrows: false,
            respondTo: 'min',
            useTransform: false
        });
    }
}*/


$(window).resize(function () {
    if ($('#quick-view').is(':visible')) {
        $('.qv-product-images').slick('setPosition');
    }
});
