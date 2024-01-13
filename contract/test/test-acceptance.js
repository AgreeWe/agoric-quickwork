// @ts-check

import '@endo/init/pre-bundle-source.js'
import '@agoric/zoe/tools/prepare-test-env.js'
import test from 'ava'
import { E } from '@endo/eventual-send'
import { init } from './common.js'

test('Acceptance - by any', async t => {
  const [zoe, { creatorFacet, publicFacet }] = await init(E, {
    approvalThreshold: 0.000001
  })

  const i0 = await E(creatorFacet).makeApproverInvitation()
  const s0 = await E(zoe).offer(i0)
  const a0 = await E(s0).getOfferResult()

  const i1 = await E(creatorFacet).makeApproverInvitation()
  const s1 = await E(zoe).offer(i1)
  const a1 = await E(s1).getOfferResult()

  const i2 = await E(creatorFacet).makeApproverInvitation()
  const s2 = await E(zoe).offer(i2)
  const a2 = await E(s2).getOfferResult()
  
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet'
  )

  await E(a1).approve()

  t.assert(
    await E(publicFacet).isApproved(),
    'Must be approved by a single vote'
  )
})

test('Acceptance - by majority', async t => {
  const [zoe, { creatorFacet, publicFacet }] = await init(E, {
    approvalThreshold: 0.51
  })

  const i0 = await E(creatorFacet).makeApproverInvitation()
  const s0 = await E(zoe).offer(i0)
  const a0 = await E(s0).getOfferResult()

  const i1 = await E(creatorFacet).makeApproverInvitation()
  const s1 = await E(zoe).offer(i1)
  const a1 = await E(s1).getOfferResult()

  const i2 = await E(creatorFacet).makeApproverInvitation()
  const s2 = await E(zoe).offer(i2)
  const a2 = await E(s2).getOfferResult()

  const i3 = await E(creatorFacet).makeApproverInvitation()
  const s3 = await E(zoe).offer(i3)
  const a3 = await E(s3).getOfferResult()
  
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet'
  )

  await E(a0).approve()
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet, got 1 / 4'
  )

  await E(a1).approve()
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet, got 2 / 4'
  )

  await E(a2).approve()
  t.assert(
    await E(publicFacet).isApproved(),
    'Must be approved by a majority, 3 / 4'
  )
})

test('Acceptance - by unanimous consent', async t => {
  const [zoe, { creatorFacet, publicFacet }] = await init(E, {
    approvalThreshold: 1
  })

  const i0 = await E(creatorFacet).makeApproverInvitation()
  const s0 = await E(zoe).offer(i0)
  const a0 = await E(s0).getOfferResult()

  const i1 = await E(creatorFacet).makeApproverInvitation()
  const s1 = await E(zoe).offer(i1)
  const a1 = await E(s1).getOfferResult()

  const i2 = await E(creatorFacet).makeApproverInvitation()
  const s2 = await E(zoe).offer(i2)
  const a2 = await E(s2).getOfferResult()

  const i3 = await E(creatorFacet).makeApproverInvitation()
  const s3 = await E(zoe).offer(i3)
  const a3 = await E(s3).getOfferResult()
  
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet'
  )

  await E(a0).approve()
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet, got 1 / 4'
  )

  await E(a1).approve()
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet, got 2 / 4'
  )

  await E(a2).approve()
  t.assert(
    !(await E(publicFacet).isApproved()),
    'Should not be approved yet, got 3 / 4'
  )

  await E(a3).approve()
  t.assert(
    await E(publicFacet).isApproved(),
    'Must be approved by an unanimous consent, 4 / 4'
  )
})
