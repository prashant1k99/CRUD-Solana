'use client'

import { PublicKey } from '@solana/web3.js'
import { ellipsify } from '../ui/ui-layout'
import { ExplorerLink } from '../cluster/cluster-ui'
import { useCrudappProgram, useCrudappProgramAccount } from './crudapp-data-access'
import { useState, useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudappCreate() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState("")
  const { createEntry } = useCrudappProgram()
  const { publicKey } = useWallet()

  const isFormValid = title.trim() !== "" && message.trim() !== ""

  const handleSubmit = async () => {
    if (publicKey && isFormValid) {
      await createEntry.mutateAsync({
        title,
        message,
        owner: publicKey
      })
      setTitle("")
      setMessage("")
    }
  }

  if (!publicKey) {
    return (
      <p>Connect your wallet</p>
    )
  }

  return (
    <div className='w-full flex flex-col gap-4 justify-center items-center'>
      <input
        type='text'
        className='input input-bordered w-full'
        placeholder='Title'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder='Add your message here'
        className='textarea textarea-bordered w-full'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={createEntry.isPending}
        className='btn w-full btn-primary'
      >
        Create {createEntry.isPending && '...'}
      </button>
    </div>
  )
}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }

  function handleRefresh() {
    accounts.refetch()
  }

  return (
    <div className={'space-y-6'}>
      <button onClick={handleRefresh} className='btn btn-xs btn-primary'>
        Refresh
      </button>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudappCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useCrudappProgramAccount({
    account,
  })

  const { publicKey } = useWallet();
  const [message, setMessage] = useState(accountQuery.data?.message as string)
  const [modifyMessage, setModifyMessage] = useState(false);
  const title = accountQuery.data?.title as string

  const isFormValid = message && message.trim() !== ""

  const handleUpdateSubmit = async () => {
    if (publicKey && isFormValid) {
      await updateEntry.mutateAsync({
        title,
        message,
        owner: publicKey
      })
      setModifyMessage(false)
    }
  }

  const handleUpdate = () => {
    setMessage(accountQuery.data?.message || "")
    setModifyMessage(true)
  }

  const handleDeleteSubmit = () => {
    console.log("Deleting Entry")
    if (publicKey) {
      deleteEntry.mutateAsync({
        title,
        message,
        owner: publicKey
      })
    }

  }

  if (!publicKey) {
    return (
      <p>Connect your wallet</p>
    )
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span>
  ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content w-full">
      <div className="card-body items-center text-center w-full">
        <div className="space-y-6 w-full">
          <div className="text-center w-full space-y-4">
            <h2 className='card-title justify-center text-3xl cursor-pointer'>{accountQuery.data?.title}</h2>
            {!modifyMessage ? (
              <p>{accountQuery.data?.message}</p>
            ) : (
              <textarea placeholder='' value={message} onChange={(e) => setMessage(e.target.value)} className='textarea textarea-bordered w-full' />
            )}
            <p>
              <ExplorerLink path={`account/${account}`} label={ellipsify(account.toString())} />
            </p>
          </div>
          <div className="card-actions w-full justify-around">
            {!modifyMessage ? (
              <>
                <button onClick={handleUpdate} className='btn lg:btn-md btn-primary'>Update Entry</button>
                <button onClick={handleDeleteSubmit} disabled={deleteEntry.isPending} className='btn lg:btn-md btn-error'>Delete Entry</button>
              </>
            ) : (
              <>
                <button onClick={handleUpdateSubmit} disabled={updateEntry.isPending} className='btn lg:btn-md btn-primary'>
                  Update Entry {updateEntry.isPending && '...'}
                </button>
                <button onClick={() => setModifyMessage(false)} disabled={updateEntry.isPending} className='btn lg:btn-md btn-error'>Cancel</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
