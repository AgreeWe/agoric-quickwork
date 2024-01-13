// @ts-check

import '@agoric/zoe/exported.js'
import { Far } from '@endo/marshal'
import { makeStore } from '@agoric/store'
import { assert, details as X } from '@agoric/assert'

const start = async zcf => {
  const {
    title,
    approvalThreshold,
  } = zcf.getTerms()

  assert(!Number.isNaN(approvalThreshold), `Approval threshold must be a number`)
  assert(approvalThreshold > 0, X`Approval threshold must be greater then 0`)
  assert(approvalThreshold <= 1, X`Approval threshold must be lesser then 1`)

  // Approves are stored as integers against seats
  // -  0 - didn't yet voted, abstained or disapproved;
  // -  1 - task is approved;
  const approves = makeStore('approves')

  /**
   * Funders (one who fund the task) and Approvers (ones who approves,
   * validates that the task has been completed and requirements are
   * met) are not the same according to the AgreeWe Quickwork business
   * requirements. Example:
   * 
   *   Bob hired Alice to build a web banner for his marketing
   *   campaign. But Bob know nothing about advertisement and asked
   *   his friend Mark to verify that the end result actually worth
   *   paying.
   *   
   *   In this scenario, Bob is a Funder, Alice is an Executor and
   *   Mark is approver (acts as a 3d party in scope of the agreement
   *   between Bob and Alice).
   * 
   * In some cases, a person may be a Funder and an Approver at the
   * same time. To achive that, he has to be provided both with
   * Funder invitation and Approver invitation. In cases when a task
   * is public, and the ability to approve the task should correspond
   * to the amount of funds provided for the task - the manager
   * contract should be used (which is not a part of the current
   * iteration)
   * 
   * @param {ZCFSeat} seat 
   */
  const makeApprover = seat => {
    // When invitation is `unwrapped` we start counting 
    // on this approver. Set approval to default.
    approves.init(seat, 0)

    return Far('approver', {
      approve: code => {
        assert(!seat.hasExited(), X`the seat has exited`)

        code = typeof code === 'undefined' ? 1 : Number(code)
        assert([0, 1].includes(code), X`Wrong approval code`)

        approves.set(seat, code)

        return `Quickwork was ${code > 0 ? '' : 'dis'}approved`
      },
    })
  }

  const creatorFacet = Far('creatorFacet', {
    makeApproverInvitation: () => zcf.makeInvitation(makeApprover, 'approver'),
  })

  const publicFacet = Far('publicFacet', {
    getTitle: () => title,

    /**
     * Shows if the task has enough approvals to be considered
     * approved according to the task terms.
     * 
     * @returns {boolean}
     */
    isApproved: () => {
      let count = 0
      let sum = 0
      for (const vote of approves.values()) {
        sum += vote
        count++
      }
      return (sum / count) >= approvalThreshold
    }

  })

  return {
    creatorFacet,
    publicFacet,
  }
}

harden(start)
export { start }
