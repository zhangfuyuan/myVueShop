<template>
  <div>

    <nav-header/>

    <nav-bread><span>确认订单</span></nav-bread>

    <div class="container">
      <div class="page-title-normal">
        <h2 class="page-title-h2"><span>结账</span></h2>
      </div>

      <!-- 进度条 -->
      <div class="check-step">
        <ul>
          <li class="cur"><span>确认</span> 地址</li>
          <li class="cur"><span>查看你的</span> 订单</li>
          <li class="cur"><span>准备</span> 付款</li>
          <li class="cur"><span>订单</span> 证明</li>
        </ul>
      </div>

      <div class="order-create">
        <div class="order-create-pic"><img src="/static/img/ok-2.png" alt=""></div>
        <div class="order-create-main">
          <h3>恭喜你! <br>你的订单正在处理中...</h3>

          <p>
            <span>订单 号：{{orderId}}</span>
            <span>订单 总价：￥{{orderTotal}}</span>
          </p>

          <div class="order-create-btn-wrap">
            <div class="btn-l-wrap">
              <a href="javascript:;" class="btn btn--m">去 购物车</a>
            </div>

            <div class="btn-r-wrap">
              <a href="javascript:;" class="btn btn--m">去 商城</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <nav-footer/>

  </div>
</template>

<script>
  import NavHeader from '@/components/Header'
  import NavFooter from '@/components/Footer'
  import NavBread from '@/components/NavBread'

  export default {
    components:{
      NavHeader,
      NavFooter,
      NavBread,
    },
    data(){
      return{
        orderId: '',
        orderTotal: 0
      }
    },
    created(){
      this.init();
    },
    methods: {
      init(){
        let orderId = this.$route.query.orderId;

        if(!orderId) return;

        this.$http.get('/users/orderDetail',{
          params:{
            orderId:orderId
          }
        }).then(result=>{
          let res = result.data;

          if(res.status === 200){
            this.orderId = res.data.orderId;
            this.orderTotal = res.data.orderTotal;
          }
        })
      }
    }
  }
</script>
