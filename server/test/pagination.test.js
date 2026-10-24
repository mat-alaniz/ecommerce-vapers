import test from 'node:test'
import assert from 'node:assert/strict'
import { paginatedResponse, parsePagination } from '../src/utils/pagination.js'

test('parsePagination uses defaults for missing and invalid values', () => {
  assert.deepEqual(parsePagination({}), {
    page: 1,
    pageSize: 20,
    from: 0,
    to: 19
  })

  assert.deepEqual(parsePagination({ page: '0', limit: '-1' }), {
    page: 1,
    pageSize: 20,
    from: 0,
    to: 19
  })
})

test('parsePagination caps page size and calculates row range', () => {
  assert.deepEqual(parsePagination({ page: '3', limit: '250' }), {
    page: 3,
    pageSize: 100,
    from: 200,
    to: 299
  })
})

test('paginatedResponse returns page metadata and results', () => {
  const pagination = parsePagination({ page: '2', limit: '5' })

  assert.deepEqual(paginatedResponse([{ id: 6 }], pagination, 11), {
    data: [{ id: 6 }],
    page: 2,
    pageSize: 5,
    total: 11
  })
})
