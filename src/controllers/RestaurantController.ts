import { Request, Response } from 'express'
import Restaurant from '../models/restaurant'

const searchRestaurant= async(req: Request, res: Response): Promise<any> => {
  try{
    const city = req.params.city

    const searchQuery = (req.query.searchQuery as string) || ""
    const selectedCuisines = (req.query.selectedCuisines as string) || ""
    const sortOption = (req.query.sortOption as string) || "lastUpdated"
    const page = parseInt(req.query.page as string) || 1
    // You can additional sorting options here for the so it can search based on estimated delivery time, cuisines, and the search query narrows down the search
    // through the search bar although cuisine can also be used in the search bar, and based on the first main search which is the location of the city

    // The type is any since types for queries can be complicated, and the things we can search for are vast and there's no need to limit it most of the time,
    // That's we're using any as our type
    let query: any = {}
    // Ignore case (Ex: london = London)
    query["city"] = new RegExp(city, "i")

    // cityCheck will count the number of records based on the query
    const cityCheck = await Restaurant.countDocuments(query)
    
    if(cityCheck === 0){
      return res.status(404).json({
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pages: 1
        }
      })

      //Returns an empty array since the frontend is expecting an array nonetheless
    }

    if(selectedCuisines){
      // cuisinesArray, is going to be a series of strings - this is what it looks like in URL: selectedCuisines=Italian,Burgers,Chinese
      // as for the split, it will turn the cuisines into one whole array, then map will loop through each element in the array splitted by the comma
      // any case wouldn't matter here for each cuisine
      // Example [italian,burgers,chinese]
      // So what I think it does is that each lowercase cuisines are searched on top of the other search queries and options
      const cuisinesArray = selectedCuisines.split(",").map((cuisine) => new RegExp(cuisine, "i"))
      // It returns the documents that have the checked cuisines in them only altogether
      query["cuisines"] = { $all: cuisinesArray }
    }


    if(searchQuery){
      const searchRegex = new RegExp(searchQuery, "i")

      query["$or"] = [
        // It will search records from the search input, it will either find the matches for restaurantName,
        // or any of the elements in the array of cuisines for each restaurant, that's what $in is used for, it will only find an element of the array 
        // that matches the search input 
        { restaurantName: searchRegex },
        { cuisines: { $in: searchRegex } }
      ]
    }

    const pageSize = 10
    // Skip is the amount of records you have to skip to get to the page where you'll click 
    const skip = (page-1) * pageSize

    // 1 means the records are in the right order based on the field
    // 1 is ascending order for sorting (it's like a-z)
    const restaurants = await Restaurant.find(query).sort({ [sortOption] : 1 }).skip(skip).limit(pageSize).lean()
    // LEAN METHOD Strips out the metadata from mongoose and turns the results of the restaurants variable into JAVASCRIPT OBJECTS

    // skip is used depending on the page it's in, it makes sure all records aren't fetched for each page
    // combines all the queries together, including the optionalones
    const total = await Restaurant.countDocuments(query)

    const response = {
      data: restaurants,
      pagination: {
        // total records of the query
        total,
        // the current page navigated to
        page,
        // number of pages depending on the results/query
        pages: Math.ceil(total/pageSize) // 50 results is 5 pages
      }
    }
    res.json(response)
  }
  catch(error){
    console.log(error)
    res.status(500).json({ message: "Something went wrong"})
  }
}

export default {
  searchRestaurant
}