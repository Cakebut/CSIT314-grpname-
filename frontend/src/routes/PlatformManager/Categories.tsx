import React, { useState } from "react";
import { Tag, Edit, Trash2 } from "lucide-react"; // Import necessary icons for edit and delete
import "./Categories.css";

interface Category {
  id: string;
  name: string;
  description: string;
  colorTag: string;
  createdDate: string;
  status: "Active" | "Inactive";
}

const categoriesData: Category[] = [
  {
    id: "cat-001",
    name: "Medical Support",
    description: "Healthcare services including doctor visits, medication assistance, and more.",
    colorTag: "Medical Support",
    createdDate: "Oct 15, 2025",
    status: "Active",
  },
  {
    id: "cat-002",
    name: "Transport Services",
    description: "Transportation assistance for medical appointments, grocery shopping, etc.",
    colorTag: "Transport Services",
    createdDate: "Oct 16, 2025",
    status: "Active",
  },
  {
    id: "cat-003",
    name: "Household Help",
    description: "Assistance with cleaning, cooking, laundry, and general home maintenance.",
    colorTag: "Household Help",
    createdDate: "Oct 17, 2025",
    status: "Active",
  },
  {
    id: "cat-004",
    name: "Companionship",
    description: "Social visits, conversation, and emotional support for isolated individuals.",
    colorTag: "Companionship",
    createdDate: "Oct 18, 2025",
    status: "Active",
  },
];

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(categoriesData);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleEdit = (categoryId: string) => {
    alert(`Editing category with ID: ${categoryId}`);
    // You can implement category edit logic here
  };

  const handleDelete = (categoryId: string) => {
    const updatedCategories = categories.filter((category) => category.id !== categoryId);
    setCategories(updatedCategories);
    alert(`Category with ID: ${categoryId} deleted`);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Service Categories</h1>
        <p>Manage volunteer service categories for the platform</p>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="categories-table">
        <div className="table-header">
          <span>Category Name</span>
          <span>Color Tag</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {filteredCategories.map((category) => (
          <div key={category.id} className="table-row">
            <span>{category.name}</span>
            <span className={`color-tag ${category.colorTag.replace(" ", "-").toLowerCase()}`}>
              <Tag /> {category.colorTag}
            </span>
            <span className={`status ${category.status.toLowerCase()}`}>{category.status}</span>
            <div className="action-buttons">
              <button onClick={() => handleEdit(category.id)} className="edit-button">
                <Edit />
              </button>
              <button onClick={() => handleDelete(category.id)} className="delete-button">
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="create-category-button">
        <button>Create Category</button>
      </div>
    </div>
  );
};

export default Categories;
