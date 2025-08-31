import { Link } from 'react-router-dom'
import { 
  StarIcon, 
  TruckIcon, 
  ShieldCheckIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon 
} from '@heroicons/react/24/solid'

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section - 全屏橫幅 */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white py-32 px-4 overflow-hidden">
        {/* 背景裝飾 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-24 h-24 rounded-full bg-white animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full bg-white animate-ping"></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-white/90 text-sm font-medium">🏆 台灣最受歡迎的香腸專賣店</span>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
            Delicioso
          </h1>
          
          <p className="text-2xl md:text-3xl font-light mb-4 text-red-100">
            最新鮮 · 最美味 · 最道地
          </p>
          
          <p className="text-lg md:text-xl mb-12 text-red-200 max-w-2xl mx-auto leading-relaxed">
            傳承三十年的職人精神，每一根香腸都是味蕾的藝術品
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/products" 
              className="group bg-white text-red-600 px-10 py-4 rounded-full text-xl font-semibold hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              <span className="flex items-center justify-center">
                立即選購
                <FireIcon className="w-6 h-6 ml-2 group-hover:animate-bounce" />
              </span>
            </Link>
            
            <button className="group bg-transparent border-2 border-white text-white px-10 py-4 rounded-full text-xl font-semibold hover:bg-white hover:text-red-600 transition-all duration-300">
              <span className="flex items-center justify-center">
                了解更多
                <HeartIcon className="w-6 h-6 ml-2 group-hover:text-red-500" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 特色介紹 */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              為什麼選擇 Delicioso？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              我們堅持最高品質標準，只為給您最完美的香腸體驗
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <SparklesIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">新鮮現做</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                每日清晨現做，選用當天最新鮮的食材，絕不使用隔夜原料
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ 每日凌晨 4:00 開始製作</li>
                <li>✓ 當天售完絕不隔夜</li>
                <li>✓ 溫控運送保持最佳口感</li>
              </ul>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">品質保證</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                嚴選台灣在地優質豬肉，通過 ISO 22000 食品安全認證
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ CAS 認證優質豬肉</li>
                <li>✓ 無添加防腐劑</li>
                <li>✓ 定期第三方檢驗</li>
              </ul>
            </div>
            
            <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-400 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">快速配送</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                專業冷鏈物流，台北市區 2 小時內到貨，全台隔日配送
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li>✓ 低溫冷鏈運送</li>
                <li>✓ 即時配送追蹤</li>
                <li>✓ 滿額免運費</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 客戶評價 */}
      <section className="py-24 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              顧客真心推薦
            </h2>
            <p className="text-xl text-gray-600">
              超過 50,000+ 滿意顧客的五星好評
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "林小姐",
                location: "台北市",
                rating: 5,
                comment: "真的太好吃了！香腸的口感Q彈有勁，調味也很棒，已經回購好多次了！",
                avatar: "👩‍🍳"
              },
              {
                name: "陳先生", 
                location: "新竹市",
                rating: 5,
                comment: "配送速度超快，包裝也很用心。重點是香腸真的很新鮮，家人都很喜歡！",
                avatar: "👨‍💼"
              },
              {
                name: "王媽媽",
                location: "台中市", 
                rating: 5,
                comment: "買來當伴手禮送朋友，大家都說讚！現在變成我們家的指定品牌了。",
                avatar: "👩‍🦳"
              }
            ].map((review, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-2xl mr-4">
                    {review.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{review.name}</h4>
                    <p className="text-sm text-gray-500">{review.location}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-gray-600 leading-relaxed">"{review.comment}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-red-600 to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white animate-float"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 rounded-full bg-white animate-float animation-delay-1000"></div>
          <div className="absolute top-1/2 right-1/4 w-12 h-12 rounded-full bg-white animate-float animation-delay-2000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            現在就開始您的美味之旅
          </h2>
          <p className="text-xl md:text-2xl mb-12 text-red-100">
            新會員註冊立享 9 折優惠，滿千免運費
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/register" 
              className="group bg-white text-red-600 px-12 py-4 rounded-full text-xl font-bold hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl"
            >
              立即註冊享優惠
            </Link>
            
            <Link 
              to="/products" 
              className="group bg-transparent border-2 border-white text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-white hover:text-red-600 transition-all duration-300"
            >
              直接開始購物
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home