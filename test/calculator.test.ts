import test from 'ava'
import { expectTypeOf } from 'expect-type'

import { CalculatorTool } from '@/tools/calculator'

import { createTestAgenticRuntime } from './_utils'

test('CalculatorTool', async (t) => {
  const agentic = createTestAgenticRuntime()
  const tool = new CalculatorTool({ agentic })

  const res = await tool.call({ expression: '1 + 1' })
  t.is(res, 2)
  expectTypeOf(res).toMatchTypeOf<number>()

  const res2 = await tool.callWithMetadata({ expression: 'cos(0)' })
  t.is(res2.result, 1)
  expectTypeOf(res2.result).toMatchTypeOf<number>()

  const { taskId, callId, parentCallId, parentTaskId, ...metadata } =
    res2.metadata
  t.true(typeof taskId === 'string')
  t.true(typeof callId === 'string')
  t.deepEqual(metadata, {
    success: true,
    taskName: 'calculator',
    cacheStatus: 'miss',
    numRetries: 0,
    error: undefined
  })
})

test.only('CalculatorTool - caching', async (t) => {
  const agentic = createTestAgenticRuntime()
  const tool = new CalculatorTool({ agentic })

  const res = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res.result, 6)
  t.is(res.metadata.cacheStatus, 'miss')
  expectTypeOf(res.result).toMatchTypeOf<number>()

  const res2 = await tool.callWithMetadata({ expression: '2 * 3' })
  t.is(res2.result, 6)
  t.is(res2.metadata.cacheStatus, 'hit')
})
