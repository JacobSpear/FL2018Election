#Formatting Functions

#Removes commas from integers with >3 digits represented as strings
#Example: ('1,456,552' -> 1456552)
def comma_del(my_str):
    if type(my_str)==int or type(my_str)==float:
        return my_str
    else:    
        my_list = my_str.split(",")
        output = ""
        for element in my_list:
            output+=element
        output = int(output)
        return output

#Removes leading 0's from string representations of integers
#Example: ('0000151' -> 151)
def remove_zeros(my_str):
    i=0
    for char in my_str:
        if char=="0":
            i+=1
        if char!="0":
            return(my_str[slice(i,len(my_str),1)])