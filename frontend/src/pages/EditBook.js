import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import api from "../services/api"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { ArrowLeft, Save, X } from "lucide-react"
import { useToast } from "../components/ui/use-toast"

const EditBook = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    description: "",
    publishedYear: "",
    publisher: "",
    pages: "",
    language: "English",
    coverImage: "",
    status: "available",
  })

  const categories = [
    "Fiction",
    "Non-Fiction",
    "Science Fiction",
    "Fantasy",
    "Mystery",
    "Thriller",
    "Romance",
    "Biography",
    "History",
    "Self-Help",
    "Business",
    "Technology",
    "Science",
    "Philosophy",
    "Religion",
    "Art",
    "Poetry",
    "Drama",
    "Children",
    "Young Adult",
    "Other",
  ]

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese",
    "Japanese",
    "Arabic",
    "Hindi",
    "Other",
  ]

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true)
        const response = await api.getBook(id)

        // Format the data for the form
        const book = response.data
        setFormData({
          title: book.title || "",
          author: book.author || "",
          isbn: book.isbn || "",
          category: book.category || "",
          description: book.description || "",
          publishedYear: book.publishedYear ? book.publishedYear.toString() : "",
          publisher: book.publisher || "",
          pages: book.pages ? book.pages.toString() : "",
          language: book.language || "English",
          coverImage: book.coverImage || "",
          status: book.status || "available",
        })
      } catch (error) {
        console.error("Error fetching book:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load book details",
        })

        // Mock data for demonstration
        setFormData({
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          isbn: "9780061120084",
          category: "Fiction",
          description:
            "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.",
          publishedYear: "1960",
          publisher: "HarperCollins",
          pages: "336",
          language: "English",
          coverImage: "https://images-na.ssl-images-amazon.com/images/I/71FxgtFKcQL.jpg",
          status: "available",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id, toast])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)

      // Convert pages and publishedYear to numbers
      const bookData = {
        ...formData,
        pages: formData.pages ? Number.parseInt(formData.pages) : null,
        publishedYear: formData.publishedYear ? Number.parseInt(formData.publishedYear) : null,
      }

      await api.updateBook(id, bookData)

      toast({
        title: "Book updated",
        description: "The book has been successfully updated",
      })

      navigate(`/books/${id}`)
    } catch (error) {
      console.error("Error updating book:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update the book",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link to={`/books/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Book</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Book Information</CardTitle>
            <CardDescription>Update the details of the book.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input id="author" name="author" value={formData.author} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN *</Label>
                <Input id="isbn" name="isbn" value={formData.isbn} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input
                  id="publishedYear"
                  name="publishedYear"
                  type="number"
                  min="1000"
                  max={new Date().getFullYear()}
                  value={formData.publishedYear}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input id="publisher" name="publisher" value={formData.publisher} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input id="pages" name="pages" type="number" min="1" value={formData.pages} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="coverImage">Cover Image URL</Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder="https://example.com/book-cover.jpg"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate(`/books/${id}`)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default EditBook
