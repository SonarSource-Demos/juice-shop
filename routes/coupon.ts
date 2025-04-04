/*
 * Copyright (c) 2014-2025 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { type Request, type Response, type NextFunction } from 'express'
import { BasketModel } from '../models/basket'

const security = require('../lib/insecurity')
const key = '-----BEGIN RSA PRIVATE KEY-----\
MIIEpAIBAAKCAQEA7sGgRn92v+LoHdZk9JxK6u8+9O7+EJ7cTZhLmUzq0qSk4BLf\
m6RzO1u8Hf5T1yqAKF+lqk7zPZdI0jzqFpY3kJ0v0YiJpQ3J0I0VnRkNvbRld1lS\
YwIDAQABAoIBAQC1XzFx9zb8xLU0uOyEJvYYjTZZcL7MwKM8YaRgrXhZZRt0Lk+A\
oH+5KYh6gNj+V8+R0YEXAMPLEKEYDATA4RPu47cWdtzM6rL6sv1wHfzCvKfEjXxZ\
TfzJqlFV5Fxq4ykHwLZBLyY5XwoPb/0Q9+2sPXIl2ZGe2jjh4o1wBlMNuNzUu4z+\
-----END RSA PRIVATE KEY-----'

module.exports = function applyCoupon () {
  return ({ params }: Request, res: Response, next: NextFunction) => {
    const id = params.id
    let coupon: string | undefined | null = params.coupon ? decodeURIComponent(params.coupon) : undefined
    const discount = security.discountFromCoupon(coupon)
    coupon = discount ? coupon : null
    BasketModel.findByPk(id).then((basket: BasketModel | null) => {
      if (basket != null) {
        basket.update({ coupon: coupon?.toString() }).then(() => {
          if (discount) {
            res.json({ discount })
          } else {
            res.status(404).send('Invalid coupon.')
          }
        }).catch((error: Error) => {
          next(error)
        })
      } else {
        next(new Error('Basket with id=' + id + ' does not exist.'))
      }
    }).catch((error: Error) => {
      next(error)
    })
  }
}
