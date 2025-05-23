"use client";
import React, { useState } from 'react';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader
} from './ui/sidebar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import useGetMarketData from '@/hooks/useGetMarketData';
import LoadingSpinner from './ui/loadingSpinner';

interface AppSideBarProps {
	setSearch: React.Dispatch<React.SetStateAction<string>>;
}

const AppSideBar = ({ setSearch }: AppSideBarProps) => {
	const [inputValue, setInputValue] = useState<string>("");
	const [searchSymbol, setSearchSymbol] = useState<string>("");

	let { data, loading, error } = useGetMarketData(searchSymbol);
	
	const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const trimmed = inputValue.trim();
		if (trimmed === "") return;
		setSearchSymbol(trimmed);
		setSearch(trimmed);
		setInputValue("");
	};

	return (
		<Sidebar >
			{loading && <div className='w-full h-full absolute inset-0 z-1 flex items-center justify-center bg-blue-950 opacity-40'><LoadingSpinner /></div>}
			{error && <p className="text-red-500">{error}</p>}
			<SidebarHeader className="mt-10 px-7">SK</SidebarHeader>
			<SidebarContent className="px-4">
				<SidebarGroupLabel>Search</SidebarGroupLabel>
				<SidebarGroup>
					{error && <p className="text-red-500">{error}</p>}
					<form className="flex items-center flex-col gap-4 justify-between">
						<Input
							type="text"
							placeholder="Search..."
							className="w-full"
							aria-label="Search"
							aria-describedby="search"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
						/>
						<Button className="w-full" type="submit" onClick={(e)=>handleSubmit(e)}>
							<span className="text-sm font-medium">
								Search
							</span>
						</Button>
					</form>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
};

export default AppSideBar;
