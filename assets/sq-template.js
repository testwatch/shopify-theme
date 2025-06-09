window.sq = window.sq || {};
window.sq.templates = {
  gridItem: `
 <div class="sparq-card" :product-handle="item.handle" :product-id="item.id">
  
    <div class='discount-label' v-if='item.compare_at_price && item.price && item.compare_at_price > item.price && item.in_stock === 1' > {{(((item.compare_at_price - item.price)/item.compare_at_price)*100).toFixed(0)}}% OFF</div>
  <div class="sparq-thumbnail-wrap">
    <a :href="'/products/' + item.handle" class="sparq-loop-product"
      :class="item.images.length >1 && item.images[1].src ? 'sq-class':''">
      <img v-if="item.image && item.image.src" :src="item.image.src" class="grid-view-item__image" />
      <img v-if="!item.image || !item.image.src" src="https://cdn.shopify.com/shopifycloud/shopify/assets/no-image-2048-5e88c1b20e087fb7bbe9a3771824e743c244f437e4f8ba93bbf7b11b53f7824c_1024x1024.gif" class="grid-view-item__image no image"/>
    </a>
  </div>
  <div class="sparq-bottom-items">
    <div class="sparq-product-title">
       <a :href=\"'/products/' + item.handle\" class="sparq-title">
       {{item.title}}
       </a>
    </div>
    <div class="sq-review" v-if="item.rating_count > 0 ">
      <sq-reviews></sq-reviews> 
    </div>
    <div class="sq-product-price">
       <div class="sparq-price">
          <div class='sq-price' v-if='!item.compare_at_price || item.price == item.compare_at_price'>{{ sq._u.format(item.price,2) }}</div>
       </div>
       <div class="sparq-compare-price">
          <span class="sparq-mrp-price"  v-if="item.compare_at_price > item.price">
           <span class="sq-mrp-final-price">{{ sq._u.format(item.price,2) }}</span>
          <span class="sq-mrp-price">{{ sq._u.format(item.compare_at_price,2) }}</span>
       </div>
 </div>
</div>
</div>
`,
};