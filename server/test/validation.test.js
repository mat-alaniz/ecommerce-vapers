import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePayment, validateStock } from '../src/utils/validation.js'

test('validateStock converts valid stock values to integers', () => {
  assert.deepEqual(validateStock({
    stock_mobile: '4',
    stock_warehouse: '0'
  }), {
    stock_mobile: 4,
    stock_warehouse: 0
  })
})

test('validatePayment accepts positive amounts and supported methods', () => {
  assert.deepEqual(validatePayment({
    amount_paid: '1250.50',
    payment_method: 'transferencia'
  }), {
    amount: 1250.5,
    paymentMethod: 'transferencia'
  })
})

test('validatePayment rejects non-positive amounts and unsupported methods', () => {
  assert.throws(
    () => validatePayment({ amount_paid: '0', payment_method: 'efectivo' }),
    /mayor que cero/
  )
  assert.throws(
    () => validatePayment({ amount_paid: '100', payment_method: 'crypto' }),
    /Método de pago inválido/
  )
})
