import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  DeleteOutline,
  Send,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  IconButton,
  Typography,
  useTheme,
  Input,
} from "@mui/material";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, removePost, addComment, setPosts } from "../../state";
import { toast } from "react-toastify";
import UserImage from "components/UserImage";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
  createdAt,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = likes && Boolean(likes[loggedInUserId]);
  const likeCount = likes && Object.keys(likes).length;
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:5000/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const deletePost = async () => {
    const response = await fetch(`http://localhost:5000/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      dispatch(removePost(postId));
      toast.success("Post deleted successfully");
    } else {
      console.error("Error deleting post");
      toast.error("Error deleting post");
    }
  };

  const fetchPost = async () => {
    const response = await fetch("http://localhost:5000/posts", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      dispatch(setPosts({ posts: data }));
    } else {
      toast.error("Error fetching post");
    }
  };

  const loggedInUserName = useSelector((state) => state.user.firstName);
  const handleAddComment = async () => {
    if (newComment.trim() === "") {
      toast.warning("Write a comment");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: loggedInUserId,
            text: `${loggedInUserName} : ${newComment}`,
          }),
        }
      );

      if (response.ok) {
        dispatch(addComment(postId, `${loggedInUserName}: ${newComment}`));
        setNewComment("");
        toast.success("Comment added");
        fetchPost();
      } else {
        toast.error("Error adding comment to the API");
      }
    } catch (error) {
      toast.error("An error occurred:", error);
    }
  };

  const deleteComment = async (commentIndex) => {
    try {
      const response = await fetch(
        `http://localhost:5000/posts/${postId}/comment/${commentIndex}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Comment deleted successfully");
        fetchPost();
      } else {
        console.error("Error deleting comment");
        toast.error("Error deleting comment");
      }
    } catch (error) {
      toast.error("An error occurred:", error);
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <FlexBetween>
        <UserImage image={userPicturePath} size="55px" />
        <FlexBetween flexDirection="column">
          <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>
            {name}
          </Typography>
          <Typography color={main}>
            {location}
            {", "}
            {createdAt &&
              new Date(createdAt).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
          </Typography>
        </FlexBetween>
      </FlexBetween>
      <Typography color={main} sx={{ m: "0.5rem 0 0 0" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:5000/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments ? comments.length : 0}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          {loggedInUserId === postUserId && (
            <DeleteOutline onClick={deletePost} />
          )}
        </IconButton>
      </FlexBetween>

      {isComments && (
        <Box mt="0.5rem" display="flex" flexDirection="column">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <FlexBetween alignItems="center">
                <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                  {comment}
                </Typography>
                {loggedInUserId === postUserId && (
                  <IconButton onClick={() => deleteComment(i)}>
                    <DeleteOutline />
                  </IconButton>
                )}
              </FlexBetween>
            </Box>
          ))}
          <Divider />
          <Box mt="1rem" ml="1rem">
            <Input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              flex="1"
            />
            <Send onClick={handleAddComment} style={{ marginLeft: "0.5rem" }}>
              Add Comment
            </Send>
          </Box>
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
