// @ts-check

import bundleSource from '@endo/bundle-source'
import { makeFakeVatAdmin } from '@agoric/zoe/tools/fakeVatAdmin.js'
import { makeZoeKit } from '@agoric/zoe'

const contractPath = `/app/contract/src/quickwork.js`

export const init = async (E, terms) => {
  const { zoeService } = makeZoeKit(makeFakeVatAdmin().admin);
  const feePurse = E(zoeService).makeFeePurse()
  const zoe = E(zoeService).bindDefaultFeePurse(feePurse)

  // Bundle the contract and install it on Zoe
  const bundle = await bundleSource(contractPath)
  const installation = await E(zoe).install(bundle)

  const instance = await E(zoe).startInstance(
    installation,
    undefined,
    terms,
  )

  return [zoe, instance]
}
