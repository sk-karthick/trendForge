"use client"
import React, { useState } from 'react'
import Navbar from './Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSideBar from '@/components/AppSideBar'
import Dashboard from './Dashboard'
import { Provider } from 'react-redux'
import { store } from '@/store/store'

const page = () => {
  
  const [search, setSearch] = useState("TCS")
  
  return (
    <Provider store={store}>
      <SidebarProvider>
        <AppSideBar setSearch={setSearch} />

        <main className='w-full h-screen'>
          <Navbar />
          <Dashboard search={search} />
        </main>
      </SidebarProvider>
    </Provider>
  )
}

export default page