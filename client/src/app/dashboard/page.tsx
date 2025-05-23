"use client"
import React, { useState } from 'react'
import Navbar from './Navbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import AppSideBar from '@/components/AppSideBar'
import Dashboard from './Dashboard'

const page = () => {
  const [search, setSearch] = useState("")
  
  return (
    <SidebarProvider>
      <AppSideBar setSearch={setSearch}/>

      <main className='w-full h-screen'>
        <Navbar />
        <Dashboard search={search}/>
      </main>
    </SidebarProvider>
  )
}

export default page