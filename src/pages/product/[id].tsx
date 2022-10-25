import axios from 'axios'
import { GetStaticPaths, GetStaticProps } from 'next'
import Image from 'next/future/image'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'
import Stripe from 'stripe'
import { stripe } from '../../lib/stripe'
import * as S from '../../styles/pages/product'

type ProductProps = {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string
    defaultPriceId: string
  }
}

const Product = ({ product }: ProductProps) => {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  const handleBuyProject = async () => {
    try {
      setIsCreatingCheckoutSession(true)

      const response  = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data

      window.location.href = checkoutUrl
    } catch (err) {
      setIsCreatingCheckoutSession(false)
      alert('fakha ao redirecionar ao checkout!')
    }
  }
  return (
    <>
      <Head>
       <title>{product.name} | Ignite Shop</title>
      </Head>
    
      <S.ProductContainer>
        <S.ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt='' />
        </S.ImageContainer>

        <S.ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>
            {product.description}
          </p>

          <button disabled={isCreatingCheckoutSession} onClick={handleBuyProject}>Comprar agora</button>
        </S.ProductDetails>
      </S.ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_MVjeqgOH3nhODT' } }
    ],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  })

  const price = product.default_price as Stripe.Price

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pr-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(price.unit_amount / 100),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}

export default Product