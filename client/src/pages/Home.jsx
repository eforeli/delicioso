import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="text-center">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          歡迎來到 Delicioso
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          最新鮮、最美味的香腸專賣店
        </p>
        <Link 
          to="/products" 
          className="bg-red-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-red-700 inline-block"
        >
          開始選購
        </Link>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">新鮮現做</h3>
          <p className="text-gray-600">每日新鮮製作，絕不過夜</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">品質保證</h3>
          <p className="text-gray-600">嚴選食材，安心品嚐</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-3">快速配送</h3>
          <p className="text-gray-600">線上下單，快速到府</p>
        </div>
      </div>
    </div>
  )
}

export default Home