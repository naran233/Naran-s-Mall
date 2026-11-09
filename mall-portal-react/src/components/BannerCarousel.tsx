import { useRef } from 'react'
import { Carousel, Empty } from 'antd'
import type { CarouselRef } from 'antd/es/carousel'
import { useNavigate } from 'react-router-dom'

export interface BannerProduct {
  id: number
  name: string
  price: number
  pic?: string
  sale?: number
}

export interface Banner {
  id: number
  name?: string
  pic: string
  url?: string
  productId?: number | null
  product?: BannerProduct | null
}

interface Props {
  banners?: Banner[]
  /** 轮播区高度，和左侧分类面板保持一致 */
  height?: number
}

/**
 * 首页轮播位。
 *
 * 与原实现的关键差异：
 * 1. 轮播位绑定商品后整张图可点击跳转商品详情（叠加商品名/价格/立即抢购）；
 * 2. 左右切换按钮由组件自己渲染，通过 CarouselRef 调 prev()/next() 控制。
 *    原因：antd 会用内部 className 覆盖自定义箭头节点（传进去的 class 被丢掉、
 *    字号被置 0），导致自定义箭头既看不见也点不到；
 * 3. 指示点默认 3px 高、20% 白几乎不可见，这里改为可点的胶囊条（见 global.css）；
 * 4. 无数据时不挂载 Carousel，直接渲染占位，避免以 0 张初始化后再变更子节点。
 */
const DOTS_CONFIG = { className: 'banner-dots' }

export default function BannerCarousel({ banners = [], height = 320 }: Props) {
  const navigate = useNavigate()
  const carouselRef = useRef<CarouselRef>(null)

  // 空数据时直接渲染占位，不挂载 Carousel
  if (!banners.length) {
    return (
      <div className="banner-empty" style={{ height }}>
        <Empty description="暂无轮播图" styles={{ image: { height: 60 } }} />
      </div>
    )
  }

  const go = (b: Banner) => {
    const productId = b.productId ?? b.product?.id
    if (productId) {
      navigate(`/product/${productId}`)
      return
    }
    const url = (b.url || '').trim()
    if (!url) return
    if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener')
    else navigate(url)
  }

  return (
    <div className="banner-wrap" style={{ height }}>
      <Carousel
        key={banners.map((b) => b.id).join('_')}
        ref={carouselRef}
        className="banner-carousel"
        autoplay={banners.length > 1}
        autoplaySpeed={4000}
        speed={500}
        dots={banners.length > 1 ? DOTS_CONFIG : false}
        arrows={false}
        infinite={banners.length > 1}
        pauseOnHover
        draggable
        swipeToSlide
        style={{ height }}
      >
        {banners.map((b) => (
          <div key={b.id}>
            <div
              className="banner-slide"
              style={{ height }}
              role="button"
              tabIndex={0}
              aria-label={b.name || '轮播图'}
              onClick={() => go(b)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  go(b)
                }
              }}
            >
              <img className="banner-img" src={b.pic} alt={b.name || ''} style={{ height }} />
              {b.product && (
                <div className="banner-info">
                  <span className="banner-tag">{b.name || '限时推荐'}</span>
                  <div className="banner-name">{b.product.name}</div>
                  <div className="banner-price">
                    <span className="cur">￥</span>
                    {b.product.price}
                    {b.product.sale != null && <span className="sale">已售 {b.product.sale}</span>}
                  </div>
                  <span className="banner-buy">立即抢购 →</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </Carousel>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            className="banner-arrow banner-arrow-prev"
            aria-label="上一张"
            onClick={() => carouselRef.current?.prev()}
          >
            ‹
          </button>
          <button
            type="button"
            className="banner-arrow banner-arrow-next"
            aria-label="下一张"
            onClick={() => carouselRef.current?.next()}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
