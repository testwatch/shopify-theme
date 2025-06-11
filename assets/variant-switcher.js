// Variant Image Switcher for Shopify
document.addEventListener('DOMContentLoaded', function() {
  // Find the variant selector - try multiple possible selectors
  const variantSelector = document.querySelector('select[name="id"]') || 
                         document.querySelector('#ProductSelect') ||
                         document.querySelector('.product-single__variants');
  
  const mainImage = document.querySelector('.zoom-cls');
  
  if (variantSelector && mainImage) {
    variantSelector.addEventListener('change', function() {
      const selectedVariantId = this.value;
      
      // Get the product data from the JSON script tag
      const productJsonScript = document.querySelector('script[id*="ProductJson"]');
      if (!productJsonScript) return;
      
      const productData = JSON.parse(productJsonScript.textContent);
      const selectedVariant = productData.variants.find(variant => variant.id == selectedVariantId);
      
      if (selectedVariant && selectedVariant.featured_image) {
        // Update main image
        const newImageUrl = selectedVariant.featured_image.src;
        
        mainImage.src = newImageUrl;
        mainImage.setAttribute('data-zoom-image', newImageUrl);
        mainImage.alt = selectedVariant.featured_image.alt || selectedVariant.title;
        
        // Update thumbnails - show only images that match this variant
        const allThumbnails = document.querySelectorAll('#ProductThumbs li');
        allThumbnails.forEach(thumb => {
          const thumbImage = thumb.querySelector('img');
          if (thumbImage && thumbImage.alt === selectedVariant.title) {
            thumb.style.display = 'block';
          } else {
            thumb.style.display = 'none';
          }
        });
        
        // Update custom variant titles if they exist
        const customTitles = document.querySelectorAll('.custom_variant_title');
        customTitles.forEach(title => {
          if (title.classList.contains(selectedVariantId)) {
            title.style.display = 'block';
          } else {
            title.style.display = 'none';
          }
        });
        
        // Update variant videos if they exist
        const variantVideos = document.querySelectorAll('#variant_id > div');
        variantVideos.forEach(video => {
          if (video.classList.contains(selectedVariantId)) {
            video.style.display = 'block';
          } else {
            video.style.display = 'none';
          }
        });
        
        // Update mobile background image
        const mobileDiv = document.querySelector('.main_div_mobile');
        if (mobileDiv && selectedVariant.featured_image) {
          mobileDiv.style.backgroundImage = `url('${selectedVariant.featured_image.src}')`;
        }
        
        // Update price displays
        const priceElements = document.querySelectorAll('.price_update');
        priceElements.forEach(priceEl => {
          // This will need to be formatted based on your currency settings
          const formattedPrice = (selectedVariant.price / 100).toFixed(2);
          priceEl.textContent = `${formattedPrice}`;
        });
      }
    });
  }
});