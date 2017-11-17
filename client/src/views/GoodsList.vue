<template>
  <div>

    <nav-header v-model="cartNum" :cartNum="cartNum"></nav-header>

    <nav-bread>商品列表</nav-bread>

    <div class="accessory-result-page accessory-page">
      <div class="container">
        <div class="filter-nav">
          <span class="sortby">排序：</span>
          <a href="javascript:void(0)" :class="{ 'cur': !isSort, 'default': true  }" @click="noSortGoods()">默认</a>
          <a href="javascript:void(0)" :class="{ 'cur': isSort, 'price': true }" @click="sortGoods()">价格 <svg class="icon icon-arrow-short"><use xlink:href="#icon-arrow-short"></use></svg></a>
          <a href="javascript:void(0)" class="filterby stopPop">Filter by</a>
        </div>
        <div class="accessory-result">
          <!-- filter -->
          <div class="filter stopPop" id="filter">
            <dl class="filter-price">
              <dt>Price:</dt>
              <dd><a href="javascript:void(0)" :class="{ 'cur': priceChecked==='all' }" @click="setPriceFilter('all')">All</a></dd>
              <dd v-for="(item, index) in priceFilter" :key="index">
                <a @click="setPriceFilter(index)" :class="{ 'cur': priceChecked===index }" href="javascript:void(0)">{{item.startPrice}} - {{item.endPrice}}</a>
              </dd>
            </dl>
          </div>

          <!-- search result accessories list -->
          <div class="accessory-list-wrap">
            <div class="accessory-list col-4">
              <ul>
                <li v-for="(item, index) in goods" :key="index">
                  <div class="pic">
                    <a href="#"><img v-lazy="'/static/img/' + item.productImage" alt=""></a>
                  </div>

                  <div class="main">
                    <div class="name">{{item.productName}}</div>
                    <div class="price">{{item.salePrice}}</div>
                    <div class="prodInfo text-right">{{item.productId}}-{{item.productNum}}</div>
                    <div class="btn-area">
                      <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                    </div>
                  </div>
                </li>

                <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="10">
                  ...
                </div>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nav-footer/>

    <!-- 在未登录的情况下 -->
    <modal :mdShow="mdShow">
      <p slot="message">请先登录，否则无法加入购物车</p>
      <div slot="btnGroup">
        <a href="javascript:;" class="btn  btn--m" @click="mdShow = false">关闭</a>
      </div>
    </modal>

    <!-- 在登录的情况下 -->
    <modal :mdShow="mdShowCart">
      <p slot="message">{{ addCartMsg }}</p>
      <div slot="btnGroup">
        <a href="javascript:;" class="btn  btn--m" @click="mdShowCart = false">继续购物</a>
        <router-link class="btn  btn--m" to="/cart">查看购物车列表</router-link>
      </div>
    </modal>

  </div>
</template>

<script>
  import NavHeader from '@/components/Header'
  import NavFooter from '@/components/Footer'
  import NavBread from '@/components/NavBread'
  import Modal from '@/components/Modal'
  import axios from 'axios'

  export default{
    data(){
      return {
        goods:[],
        busy: true,
        page: 1,
        pageSize: 8,
        isSort: false,
        sortFlag: false,
        mdShowCart:false,
        mdShow:false,
        priceChecked: 'all',
        addCartMsg: '',
        cartNum: 0,
        priceFilter: [
          {
            startPrice:'0',
            endPrice:'100'
          },
          {
            startPrice:'100',
            endPrice:'500'
          },
          {
            startPrice:'500',
            endPrice:'1000'
          },
          {
            startPrice:'1000',
            endPrice:'2000'
          }
        ]
      }
    },
    created(){
      this.getGoodsList();
    },
    methods: {
      getGoodsList() {
        let param = {
          priceLevel: this.priceChecked,
          page: this.page,
          pageSize: this.pageSize
        };

        if(this.isSort) param.sort = this.sortFlag ? 1 : -1;

        axios.get('/goods/list', { params: param }).then(result=>{
          let res = result.data;
          console.log(res.msg);

          if (res.status === 200) {
            this.goods = this.goods.concat(res.data);
            this.busy = (res.data.length===0);
          } else {
            alert(res.msg);
          }
        })
      },
      noSortGoods() {
        this.isSort = false;
        this.goods = [];
        this.page = 1;
        this.getGoodsList();
      },
      sortGoods() {
        this.isSort = true;
        this.sortFlag = !this.sortFlag;
        this.goods = [];
        this.page = 1;
        this.getGoodsList();
      },
      setPriceFilter(index) {
        this.priceChecked = index;
        this.goods = [];
        this.page = 1;
        this.getGoodsList();
      },
      loadMore() {
        this.busy = true;
        setTimeout(() => {
          this.page++;
          this.getGoodsList(true);
        }, 500);
      },
      addCart(productId) {
        axios.post('/goods/addCart',{ productId: productId }).then(result=>{
          let res = result.data;
          this.addCartMsg = res.msg;

          if (res.status === 200) {
            this.mdShowCart = true;
            this.cartNum = res.data;
          } else if (res.status === 401) {
            this.mdShow = true;
          } else {
            this.mdShowCart = true;
          }
        });
      }
    },
    components:{
      navHeader: NavHeader,
      navFooter: NavFooter,
      navBread: NavBread,
      modal: Modal
    }
  }
</script>
