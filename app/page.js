'use client';
import React, { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { collection, query, getDocs, getDoc, setDoc, deleteDoc, doc } from "firebase/firestore";
import { 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Typography 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { GoogleGenerativeAI } from "@google/generative-ai"; // Import Google Generative AI

const genAI = new GoogleGenerativeAI("AIzaSyC3DbuNOTxX41uQl_i1YgXYwcdeGFNMWC8");

async function run(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  
  return text;
}

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [recipeResult, setRecipeResult] = useState(''); // State for recipe result
  const [showRecipe, setShowRecipe] = useState(false); // State to track display mode

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const removeItem = async (item) => {
    const docRef = doc(firestore, 'inventory', item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }, { merge: true });
      }
      await updateInventory();
    }
  };

  const addItem = async (name, qty) => {
    const docRef = doc(firestore, 'inventory', name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + qty }, { merge: true });
    } else {
      await setDoc(docRef, { quantity: qty });
    }
    await updateInventory();
  };

  const generateRecipe = async () => {
    const items = inventory.map(item => item.name).join(", ");
    const prompt = `I have the following items: ${items}. Give me an amazing recipe using some or all of the items.`;
    
    try {
      const generatedRecipe = await run(prompt);
      setRecipeResult(generatedRecipe);
      setShowRecipe(true); // Set to true to show recipe
    } catch (error) {
      console.error('Error:', error);
      setRecipeResult('An error occurred while generating the recipe. Please try again.');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ 
      backgroundColor: '#f0f4c3', 
      padding: '16px', 
      textAlign: 'center', 
      minHeight: '100vh' 
    }}>
      <Typography 
          variant="h1" 
          style={{ 
            margin: '100px 0', 
            fontFamily: 'Fraunces, serif', 
            fontWeight: 700,
            color: '#3f51b5', 
          }} 
        >
          FreshlyAI
        </Typography>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',  
        padding: '20px',   
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
        backgroundColor: '#c5cae9'
      }}>
        
        <TextField 
          label="Search Pantry"
          variant="outlined"
          fullWidth
          margin="normal"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px' }}>
          <Button 
            variant='contained' 
            color="primary"
            onClick={() => {}} 
          >
            Input Item
          </Button>
          <Button 
            variant='contained' 
            color="primary"
            onClick={generateRecipe} // Call the generateRecipe function
          >
            Generate Recipe
          </Button>
        </div>
        <div style={{ padding: 16 }}>
          {!showRecipe ? ( // Conditional rendering based on showRecipe
            <div>
              <div>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity"
                  type="number"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(itemName, quantity)}
                  style={{ width: '400px', margin: '0 auto' }}
                  startIcon={<AddIcon />}
                >
                  Add Item
                </Button>
              </div>
              <TableContainer component={Paper} style={{ marginTop: '20px' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item Name</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <TableRow key={item.name}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell align="right">{item.quantity}</TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => removeItem(item.name)}>
                              <DeleteIcon />
                            </IconButton>
                            <IconButton onClick={() => editItem(item.name, prompt("Enter new quantity:", item.quantity))}>
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">No such item!</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <Typography variant="h5" style={{ color: 'black', fontWeight: 'bold', fontSize: '1.5rem', padding: '16px' }}>
                Generated Recipe:
              </Typography>
              <Typography 
                style={{ 
                  color: 'black', 
                  fontSize: '1.2rem', 
                  padding: '16px', 
                  whiteSpace: 'pre-wrap' // To display line breaks properly
                }}
              >
                {recipeResult}
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => setShowRecipe(false)} // Reset to show inventory again
                style={{ marginTop: '20px' }}
              >
                Back to Inventory
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
